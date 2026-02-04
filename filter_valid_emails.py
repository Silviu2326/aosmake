import csv

input_csv = 'emails_no_usados.csv'
output_csv = 'emails_no_usados_valid.csv'

valid_emails = []
removed_emails = []

try:
    # Leer el CSV original
    with open(input_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row in reader:
            if row.get('email_validation', '').strip().lower() == 'valid':
                valid_emails.append(row)
            else:
                removed_emails.append(row)

    # Escribir el CSV filtrado
    if valid_emails:
        with open(output_csv, 'w', newline='', encoding='utf-8') as f:
            fieldnames = ['leadNumber', 'targetID', 'email', 'firstName', 'lastName',
                         'companyName', 'personTitle', 'email_validation']

            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

            for row in valid_emails:
                writer.writerow(row)

    print(f"[OK] CSV filtrado generado exitosamente: {output_csv}")
    print(f"\n=== ESTADISTICAS ===")
    print(f"Emails con validacion 'valid': {len(valid_emails)}")
    print(f"Emails removidos (sin validacion o invalidos): {len(removed_emails)}")

    if removed_emails:
        print(f"\n=== EMAILS REMOVIDOS ===")
        for i, email in enumerate(removed_emails[:10], 1):  # Mostrar los primeros 10
            print(f"{i}. {email['email']} - {email['firstName']} {email['lastName']} ({email.get('email_validation', 'N/A')})")
        if len(removed_emails) > 10:
            print(f"... y {len(removed_emails) - 10} mas")

except FileNotFoundError:
    print(f"Error: No se encontro el archivo {input_csv}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
