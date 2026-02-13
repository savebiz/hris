import PyPDF2

try:
    with open('DataGuard HRIS PRD.pdf', 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ''
        for page in reader.pages:
            text += page.extract_text() + '\n'
            
    with open('prd_raw.txt', 'w', encoding='utf-8') as f:
        f.write(text)
        
    print("Successfully extracted text to prd_raw.txt")
except Exception as e:
    print(f"Error: {e}")
