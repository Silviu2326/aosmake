import csv

master_csv = r'backend\Copy of 01_T10_1_MASTER - Pre-Processing_Master.csv'
crm_csv = r'backend\CRM_T10_1_lap1 - Instantly_Import.csv'
output_csv = 'emails_no_usados_valid_completo.csv'

# Primero, obtener todos los emails que están en CRM
crm_emails = set()

print("[INFO] Leyendo emails del CRM...")
try:
    with open(crm_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            email = row.get('email', '').strip()
            if email:
                crm_emails.add(email)

    print(f"[OK] Emails en CRM: {len(crm_emails)}")

    # Ahora leer el Master y filtrar
    print("[INFO] Filtrando Master...")
    unused_valid_leads = []
    total_master = 0
    unused_count = 0
    valid_unused_count = 0

    with open(master_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames  # Obtener todas las columnas del Master

        for row in reader:
            total_master += 1
            email = row.get('email', '').strip()
            email_validation = row.get('email_validation', '').strip().lower()

            # Si el email NO está en CRM
            if email and email not in crm_emails:
                unused_count += 1
                # Y si tiene validación 'valid'
                if email_validation == 'valid':
                    unused_valid_leads.append(row)
                    valid_unused_count += 1

    # Escribir el CSV con todas las columnas
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()

        for row in unused_valid_leads:
            writer.writerow(row)

    print(f"\n[OK] CSV generado exitosamente: {output_csv}")
    print(f"\n=== ESTADISTICAS ===")
    print(f"Total de registros en Master: {total_master}")
    print(f"Emails NO usados (no en CRM): {unused_count}")
    print(f"Emails NO usados con validacion 'valid': {valid_unused_count}")
    print(f"\n[OK] Columnas incluidas: {len(fieldnames)}")
    print(f"Columnas: {', '.join(fieldnames[:10])}...")

except FileNotFoundError as e:
    print(f"Error: No se encontro el archivo - {e}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
