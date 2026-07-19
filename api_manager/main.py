from fastapi import FastAPI, Request, Form, Depends, HTTPException, status, Response
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import httpx
import os

from . import models, database, auth

# Initialize DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="HealthReport API Manager")

# CORS setup for the Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True, # Required for HTTP-Only cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

# Backend URL to proxy requests to
BACKEND_URL = "http://localhost:8001"

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse(request=request, name="login.html", context={"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse(request=request, name="register.html", context={"request": request})

@app.post("/register")
async def do_register(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if user:
        return templates.TemplateResponse(request=request, name="register.html", context={"request": request, "error": "Username already exists"})
    
    hashed_password = auth.get_password_hash(password)
    new_user = models.User(username=username, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    
    return RedirectResponse(url="/login", status_code=302)

@app.post("/login")
async def do_login(
    request: Request,
    response: Response,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not auth.verify_password(password, user.password_hash):
        return templates.TemplateResponse(request=request, name="login.html", context={"request": request, "error": "Invalid username or password"})
    
    access_token = auth.create_access_token(data={"sub": user.username})
    
    # Redirect to Frontend
    redirect_res = RedirectResponse(url="http://localhost:5173", status_code=302)
    # Set HTTP-Only Cookie
    redirect_res.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="lax",
        max_age=auth.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    return redirect_res

@app.post("/api/logout")
async def logout():
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie("access_token")
    return response

@app.get("/api/me")
async def get_current_user(request: Request, db: Session = Depends(database.get_db)):
    token = request.cookies.get("access_token")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token_str = token.split(" ")[1]
    payload = auth.decode_access_token(token_str)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    username = payload.get("sub")
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    return {"username": user.username, "id": user.id}

# --- REVERSE PROXY GATEWAY ---
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
async def proxy_api(path: str, request: Request):
    # 1. Verify authentication
    token = request.cookies.get("access_token")
    if not token or not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token_str = token.split(" ")[1]
    payload = auth.decode_access_token(token_str)
    if not payload or not payload.get("sub"):
        raise HTTPException(status_code=401, detail="Invalid token")
        
    # 2. Forward Request
    url = f"{BACKEND_URL}/api/{path}"
    
    headers = dict(request.headers)
    headers.pop("host", None)
    headers["x-user-id"] = payload.get("sub")
    
    async with httpx.AsyncClient(timeout=600.0) as client:
        body = await request.body()
        
        content_type = headers.get("content-type", "")
        
        if "multipart/form-data" in content_type:
            pass
            
        proxy_req = client.build_request(
            request.method,
            url,
            headers=headers,
            content=body,
            params=request.query_params
        )
        try:
            proxy_res = await client.send(proxy_req, stream=True)
            return Response(
                content=await proxy_res.aread(),
                status_code=proxy_res.status_code,
                headers={k: v for k, v in proxy_res.headers.items() if k.lower() not in ["content-encoding", "content-length", "transfer-encoding"]}
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Error proxying to backend: {exc}")
