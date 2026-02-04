import csv
import json

# Archivo de entrada
csv_file = r'backend\CRM_T10_1_lap1 - Instantly_Import.csv'
output_file = 'emails_with_all_bodies.json'

emails_with_all_bodies = []
total_rows = 0
emails_with_4_bodies = 0

try:
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row in reader:
            total_rows += 1

            # Verificar si tiene email y todos los Body1, Body2, Body3, Body4 rellenados
            email = row.get('email', '').strip()
            body1 = row.get('Body1', '').strip()
            body2 = row.get('Body2', '').strip()
            body3 = row.get('Body3', '').strip()
            body4 = row.get('Body4', '').strip()

            # Si el email existe y todos los 4 bodys están rellenados
            if email and body1 and body2 and body3 and body4:
                emails_with_all_bodies.append({
                    'email': email,
                    'firstName': row.get('firstName', ''),
                    'lastName': row.get('lastName', ''),
                    'companyName': row.get('companyName', ''),
                    'hasBody1': True,
                    'hasBody2': True,
                    'hasBody3': True,
                    'hasBody4': True
                })
                emails_with_4_bodies += 1

    # Crear el resultado
    result = {
        'total_emails_procesados': total_rows,
        'emails_con_4_bodies': emails_with_4_bodies,
        'porcentaje': round((emails_with_4_bodies / total_rows * 100) if total_rows > 0 else 0, 2),
        'emails': emails_with_all_bodies
    }

    # Guardar en JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"[OK] Procesamiento completado")
    print(f"  Total de registros procesados: {total_rows}")
    print(f"  Emails con los 4 bodys rellenados: {emails_with_4_bodies}")
    print(f"  Porcentaje: {result['porcentaje']}%")
    print(f"\n[OK] Archivo JSON generado: {output_file}")

except FileNotFoundError:
    print(f"Error: No se encontró el archivo {csv_file}")
except Exception as e:
    print(f"Error: {e}")
