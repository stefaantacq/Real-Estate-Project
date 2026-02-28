from reportlab.pdfgen import canvas
import sys

def create_pdf(filename, num_pages):
    c = canvas.Canvas(filename)
    for i in range(1, num_pages + 1):
        c.drawString(100, 800, f"Page {i}")
        c.drawString(100, 780, "BESCHRIJVING VAN HET GOED:")
        c.drawString(100, 760, "Dit is een lange tekst over een eigendom. " * 10)
        c.drawString(100, 740, f"Voornaam verkoper: [naam verkoper {i}]")
        c.showPage()
    c.save()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python script.py <filename> <num_pages>")
        sys.exit(1)
    
    filename = sys.argv[1]
    num_pages = int(sys.argv[2])
    create_pdf(filename, num_pages)
    print(f"Created {filename} with {num_pages} pages.")
