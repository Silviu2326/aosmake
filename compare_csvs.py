import csv
import json

# Archivos de entrada
master_csv = r'backend\Copy of 01_T10_1_MASTER - Pre-Processing_Master.csv'
crm_csv = r'backend\CRM_T10_1_lap1 - Instantly_Import.csv'
output_file = 'comparacion_estadisticas.json'

# Diccionarios para almacenar la información
master_emails = {}  # email -> info del lead
crm_with_4_bodies = set()  # emails con 4 bodys
crm_without_4_bodies = {}  # email -> info de qué bodys faltan
crm_all_emails = {}  # email -> info completa del CRM

total_master = 0
total_crm = 0

print("[INFO] Procesando archivo Master...")
try:
    # Leer el archivo Master
    with open(master_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_master += 1
            email = row.get('email', '').strip()
            if email:
                master_emails[email] = {
                    'leadNumber': row.get('LeadNumber', ''),
                    'targetID': row.get('TargetID', ''),
                    'firstName': row.get('firstName', ''),
                    'lastName': row.get('lastName', ''),
                    'companyName': row.get('companyName', ''),
                    'personTitle': row.get('personTitle', ''),
                    'email_validation': row.get('email_validation', '')
                }

    print(f"[OK] Master procesado: {total_master} registros, {len(master_emails)} emails unicos")

    # Leer el archivo CRM
    print("[INFO] Procesando archivo CRM...")
    with open(crm_csv, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_crm += 1
            email = row.get('email', '').strip()

            if email:
                body1 = row.get('Body1', '').strip()
                body2 = row.get('Body2', '').strip()
                body3 = row.get('Body3', '').strip()
                body4 = row.get('Body4', '').strip()

                has_body1 = bool(body1)
                has_body2 = bool(body2)
                has_body3 = bool(body3)
                has_body4 = bool(body4)

                crm_all_emails[email] = {
                    'hasBody1': has_body1,
                    'hasBody2': has_body2,
                    'hasBody3': has_body3,
                    'hasBody4': has_body4
                }

                # Si tiene los 4 bodys
                if has_body1 and has_body2 and has_body3 and has_body4:
                    crm_with_4_bodies.add(email)
                else:
                    # Si no tiene los 4 bodys
                    crm_without_4_bodies[email] = {
                        'hasBody1': has_body1,
                        'hasBody2': has_body2,
                        'hasBody3': has_body3,
                        'hasBody4': has_body4,
                        'bodys_faltantes': [
                            f'Body{i}' for i, has in enumerate([has_body1, has_body2, has_body3, has_body4], 1) if not has
                        ]
                    }

    print(f"[OK] CRM procesado: {total_crm} registros")
    print(f"    - Emails con 4 bodys: {len(crm_with_4_bodies)}")
    print(f"    - Emails sin 4 bodys: {len(crm_without_4_bodies)}")

    # Análisis de comparación
    print("\n[INFO] Realizando comparacion...")

    # Leads del Master que están en CRM con 4 bodys
    master_con_4_bodies = []
    for email in master_emails:
        if email in crm_with_4_bodies:
            lead_info = master_emails[email].copy()
            lead_info['email'] = email
            master_con_4_bodies.append(lead_info)

    # Leads del Master que están en CRM sin 4 bodys
    master_sin_4_bodies = []
    for email in master_emails:
        if email in crm_without_4_bodies:
            lead_info = master_emails[email].copy()
            lead_info['email'] = email
            lead_info['bodys_info'] = crm_without_4_bodies[email]
            master_sin_4_bodies.append(lead_info)

    # Leads del Master que NO están en CRM
    master_no_en_crm = []
    for email in master_emails:
        if email not in crm_all_emails:
            lead_info = master_emails[email].copy()
            lead_info['email'] = email
            master_no_en_crm.append(lead_info)

    # Emails en CRM que NO están en Master
    crm_no_en_master_con_4 = [email for email in crm_with_4_bodies if email not in master_emails]
    crm_no_en_master_sin_4 = [email for email in crm_without_4_bodies if email not in master_emails]

    # Crear resultado
    result = {
        'resumen': {
            'total_leads_master': total_master,
            'total_emails_unicos_master': len(master_emails),
            'total_registros_crm': total_crm,
            'total_emails_crm_con_4_bodies': len(crm_with_4_bodies),
            'total_emails_crm_sin_4_bodies': len(crm_without_4_bodies),
        },
        'analisis_master_vs_crm': {
            'leads_master_con_4_bodies': len(master_con_4_bodies),
            'leads_master_sin_4_bodies': len(master_sin_4_bodies),
            'leads_master_no_en_crm': len(master_no_en_crm),
            'porcentaje_master_con_4_bodies': round((len(master_con_4_bodies) / len(master_emails) * 100) if master_emails else 0, 2),
            'porcentaje_master_sin_4_bodies': round((len(master_sin_4_bodies) / len(master_emails) * 100) if master_emails else 0, 2),
            'porcentaje_master_no_en_crm': round((len(master_no_en_crm) / len(master_emails) * 100) if master_emails else 0, 2),
        },
        'analisis_crm_vs_master': {
            'emails_crm_no_en_master_con_4_bodies': len(crm_no_en_master_con_4),
            'emails_crm_no_en_master_sin_4_bodies': len(crm_no_en_master_sin_4),
        },
        'detalles': {
            'leads_master_con_4_bodies': master_con_4_bodies,
            'leads_master_sin_4_bodies': master_sin_4_bodies,
            'leads_master_no_en_crm': master_no_en_crm,
            'emails_crm_no_en_master_con_4_bodies': crm_no_en_master_con_4,
            'emails_crm_no_en_master_sin_4_bodies': crm_no_en_master_sin_4
        }
    }

    # Guardar en JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print("\n[OK] Analisis completado!")
    print("\n=== ESTADISTICAS ===")
    print(f"\nARCHIVO MASTER:")
    print(f"  Total de registros: {total_master}")
    print(f"  Emails unicos: {len(master_emails)}")

    print(f"\nARCHIVO CRM:")
    print(f"  Total de registros: {total_crm}")
    print(f"  Emails con 4 bodys completos: {len(crm_with_4_bodies)}")
    print(f"  Emails sin 4 bodys completos: {len(crm_without_4_bodies)}")

    print(f"\nCOMPARACION MASTER vs CRM:")
    print(f"  Leads del Master CON 4 bodys en CRM: {len(master_con_4_bodies)} ({result['analisis_master_vs_crm']['porcentaje_master_con_4_bodies']}%)")
    print(f"  Leads del Master SIN 4 bodys en CRM: {len(master_sin_4_bodies)} ({result['analisis_master_vs_crm']['porcentaje_master_sin_4_bodies']}%)")
    print(f"  Leads del Master NO encontrados en CRM: {len(master_no_en_crm)} ({result['analisis_master_vs_crm']['porcentaje_master_no_en_crm']}%)")

    print(f"\nCOMPARACION CRM vs MASTER:")
    print(f"  Emails en CRM (con 4 bodys) NO en Master: {len(crm_no_en_master_con_4)}")
    print(f"  Emails en CRM (sin 4 bodys) NO en Master: {len(crm_no_en_master_sin_4)}")

    print(f"\n[OK] Archivo JSON generado: {output_file}")

except FileNotFoundError as e:
    print(f"Error: No se encontro el archivo - {e}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
