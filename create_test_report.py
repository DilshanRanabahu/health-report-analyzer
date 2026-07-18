from PIL import Image, ImageDraw, ImageFont
import os

def create_report():
    # Create a white A4-sized image
    width, height = 1200, 1600
    img = Image.new('RGB', (width, height), color='white')
    d = ImageDraw.Draw(img)
    
    # Try to load a default font, otherwise use the very basic one
    try:
        # Load a standard Windows font
        title_font = ImageFont.truetype("arialbd.ttf", 48)
        header_font = ImageFont.truetype("arialbd.ttf", 32)
        body_font = ImageFont.truetype("arial.ttf", 28)
        small_font = ImageFont.truetype("arial.ttf", 20)
    except IOError:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
        small_font = ImageFont.load_default()

    # Draw Header
    d.text((400, 50), "LANKA HOSPITALS LABORATORY", fill="darkblue", font=title_font)
    d.text((450, 120), "COMPREHENSIVE HEALTH REPORT", fill="black", font=header_font)
    
    d.line([(50, 180), (1150, 180)], fill="black", width=3)
    
    # Patient Info
    d.text((100, 220), "Patient Name: Mr. Kamal Perera", fill="black", font=body_font)
    d.text((100, 270), "Age/Sex: 55 / Male", fill="black", font=body_font)
    d.text((800, 220), "Date: 18/07/2026", fill="black", font=body_font)
    d.text((800, 270), "Ref By: Dr. S. Fernando", fill="black", font=body_font)
    
    d.line([(50, 330), (1150, 330)], fill="black", width=2)
    
    # Table Headers
    y = 400
    d.text((100, y), "TEST NAME", fill="black", font=header_font)
    d.text((450, y), "RESULT", fill="black", font=header_font)
    d.text((650, y), "UNITS", fill="black", font=header_font)
    d.text((850, y), "REFERENCE RANGE", fill="black", font=header_font)
    
    d.line([(50, 450), (1150, 450)], fill="black", width=1)
    
    # Data Rows
    data = [
        ("HAEMATOLOGY", "", "", ""),
        ("Hemoglobin (Hb)", "10.5", "g/dL", "13.5 - 17.5"),
        ("Total WBC Count", "16,500", "/cumm", "4,500 - 11,000"),
        ("Platelet Count", "250,000", "/cumm", "150,000 - 450,000"),
        ("Erythrocyte Sedimentation Rate", "45", "mm/1st hr", "< 15"),
        ("", "", "", ""),
        ("BIOCHEMISTRY", "", "", ""),
        ("Fasting Blood Sugar (FBS)", "185", "mg/dL", "70 - 100"),
        ("HbA1c (Glycosylated Hb)", "8.2", "%", "4.0 - 5.6"),
        ("Total Cholesterol", "280", "mg/dL", "< 200"),
        ("Triglycerides", "240", "mg/dL", "< 150"),
        ("Serum Creatinine", "1.1", "mg/dL", "0.7 - 1.2")
    ]
    
    y = 500
    for row in data:
        if row[1] == "": # Section Title
            d.text((100, y), row[0], fill="darkblue", font=header_font)
        else:
            d.text((100, y), row[0], fill="black", font=body_font)
            
            # Highlight abnormal results in bold/red if possible (we'll just use text for now)
            result = row[1]
            if result in ["10.5", "16,500", "45", "185", "8.2", "280", "240"]:
                d.text((450, y), f"{result} *", fill="red", font=header_font)
            else:
                d.text((450, y), result, fill="black", font=body_font)
                
            d.text((650, y), row[2], fill="gray", font=body_font)
            d.text((850, y), row[3], fill="gray", font=body_font)
        y += 60
    
    d.line([(50, y+50), (1150, y+50)], fill="black", width=2)
    
    # Footer
    d.text((100, y+100), "* NOTE: Abnormal results are marked with an asterisk (*)", fill="red", font=body_font)
    d.text((100, y+150), "End of Report.", fill="black", font=body_font)
    d.text((400, 1500), "Generated automatically by Laboratory Information System", fill="gray", font=small_font)
    
    # Save the image
    img.save("realistic_medical_report.jpg", quality=95)
    print("Created realistic_medical_report.jpg")

if __name__ == "__main__":
    create_report()
