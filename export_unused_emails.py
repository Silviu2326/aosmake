import json
import csv

# Leer el archivo de estadísticas generado anteriormente
stats_file = 'comparacion_estadisticas.json'
output_csv = 'emails_no_usados.csv'

try:
    with open(stats_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Obtener los leads que no están en CRM
    leads_no_en_crm = data['detalles']['leads_master_no_en_crm']

    print(f"[INFO] Total de emails no usados: {len(leads_no_en_crm)}")

    # Crear el CSV
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        if leads_no_en_crm:
            # Obtener los campos del primer registro
            fieldnames = ['leadNumber', 'targetID', 'email', 'firstName', 'lastName',
                         'companyName', 'personTitle', 'email_validation']

            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

            for lead in leads_no_en_crm:
                writer.writerow(lead)

    print(f"[OK] CSV generado exitosamente: {output_csv}")
    print(f"[OK] Total de registros exportados: {len(leads_no_en_crm)}")

    # Estadísticas adicionales
    valid_emails = sum(1 for lead in leads_no_en_crm if lead.get('email_validation') == 'valid')
    invalid_emails = sum(1 for lead in leads_no_en_crm if lead.get('email_validation') != 'valid')

    print(f"\n=== ESTADISTICAS ===")
    print(f"Emails validados (valid): {valid_emails}")
    print(f"Emails sin validar o invalidos: {invalid_emails}")

except FileNotFoundError:
    print(f"Error: No se encontro el archivo {stats_file}")
    print("Ejecuta primero el script compare_csvs.py")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
