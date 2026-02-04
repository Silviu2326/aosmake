import csv
import json

# Archivo de entrada
csv_file = r'backend\CRM_T10_1_lap1 - Instantly_Import.csv'
output_file = 'emails_without_all_bodies.json'

emails_without_all_bodies = []
emails_unicos_sin_4_bodies = set()
emails_unicos_con_4_bodies = set()
total_rows = 0
registros_sin_4_bodies = 0

try:
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row in reader:
            total_rows += 1

            # Obtener los campos
            email = row.get('email', '').strip()
            body1 = row.get('Body1', '').strip()
            body2 = row.get('Body2', '').strip()
            body3 = row.get('Body3', '').strip()
            body4 = row.get('Body4', '').strip()

            # Verificar qué bodys faltan
            has_body1 = bool(body1)
            has_body2 = bool(body2)
            has_body3 = bool(body3)
            has_body4 = bool(body4)

            # Si no tiene todos los 4 bodys completos
            if not (has_body1 and has_body2 and has_body3 and has_body4):
                if email:
                    emails_without_all_bodies.append({
                        'registro_numero': total_rows,
                        'email': email,
                        'firstName': row.get('firstName', ''),
                        'lastName': row.get('lastName', ''),
                        'companyName': row.get('companyName', ''),
                        'hasBody1': has_body1,
                        'hasBody2': has_body2,
                        'hasBody3': has_body3,
                        'hasBody4': has_body4,
                        'bodys_faltantes': [
                            f'Body{i}' for i, has in enumerate([has_body1, has_body2, has_body3, has_body4], 1) if not has
                        ]
                    })
                    emails_unicos_sin_4_bodies.add(email)
                    registros_sin_4_bodies += 1
            else:
                if email:
                    emails_unicos_con_4_bodies.add(email)

    # Identificar emails que aparecen tanto con 4 bodys como sin 4 bodys
    emails_duplicados = emails_unicos_sin_4_bodies & emails_unicos_con_4_bodies

    # Crear el resultado
    result = {
        'total_registros_procesados': total_rows,
        'registros_sin_4_bodies': registros_sin_4_bodies,
        'registros_con_4_bodies': total_rows - registros_sin_4_bodies,
        'emails_unicos_sin_4_bodies': len(emails_unicos_sin_4_bodies),
        'emails_que_aparecen_tambien_con_4_bodies': list(emails_duplicados),
        'cantidad_emails_duplicados': len(emails_duplicados),
        'porcentaje_sin_4_bodies': round((registros_sin_4_bodies / total_rows * 100) if total_rows > 0 else 0, 2),
        'emails': emails_without_all_bodies
    }

    # Guardar en JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"[OK] Procesamiento completado")
    print(f"  Total de registros procesados: {total_rows}")
    print(f"  Registros SIN los 4 bodys completos: {registros_sin_4_bodies}")
    print(f"  Registros CON los 4 bodys completos: {total_rows - registros_sin_4_bodies}")
    print(f"  Emails unicos sin 4 bodys: {len(emails_unicos_sin_4_bodies)}")
    print(f"  Emails que aparecen con y sin 4 bodys: {len(emails_duplicados)}")
    print(f"  Porcentaje sin 4 bodys: {result['porcentaje_sin_4_bodies']}%")
    print(f"\n[OK] Archivo JSON generado: {output_file}")

except FileNotFoundError:
    print(f"Error: No se encontro el archivo {csv_file}")
except Exception as e:
    print(f"Error: {e}")
