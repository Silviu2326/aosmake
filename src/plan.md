


En esencia queremos:

Una tabla master dónde se adjuntan todos los outputs.
Una tabla por input de cada paso con todos los leads disponibles (y no usados ya para este paso) para un paso.
Un dashboard
Y el almacenamiento


Cosas que debe de decir el Dashboard:


Total leads (contar de export)

Total leads actualmente para input de verification (solo tiene que estar en export y no haber pasado por este paso ya)
Total leads enviados a verificación
Total leads verificados ahora mismo
Ratio de verification ahora mismo
Cantidad de leads verificados con compUrl ahora mismo
Ratio de leads verificados con compUrl (con compUrl del total de verificados)

Total leads con compUrl 
Ratio de leads con compUrl (del total)

Total leads actualmente para input de company scrap (tiene que ser verificado y no haber sido enviado a este paso ya)
Total de leads enviados a compScrap
Total leads con compScrap
Ratio de scrap (con compScrap sobre enviados a compScrap)

Total leads actualmente para input de box 1 (tienen que tener compScrap, y por lo tanto verificados claro)
Total leads enviados a box1
Total leads DROP
Ratio de DROP y ratio de FIT 
Total Leads FIT pero noHIT (es decir → almacenamiento)
Ratio de Almacenamiento
Ratio de FIT&HIT

Total leads actualmente listos para enviar a Instantly
Total leads enviados a Instantly
Ratio de respuesta
Ratio de respuesta positiva
Ratio de conversión

Zona estimación:
Total (de export)
Estimado verificado (total export * ratio verificación actual)
Estimado compScrap (estimado verificado * ratio de compScrap actual)
Estimado FIT&HIT (compScrap * ratio de FIT&HIT actual)
Estimado respuesta positiva (estimado FIT&HIT * ratio de respuesta positiva actual)
Estimado conversion (estiamdo respuesta positiva * ratio de conversion actual)





Columnas de cada página:


Master: 

LeadNumber	                                             companyName
TargetID	                                             companyDescription
firstName	                                             companyTagLine
lastName	                                             industry
personTitle	                                             employeeCount
personTitleDescription	                     companyLocation
personSummary	                                 website
personLocation	                                 domain
durationInRole	                                            yearFounded
durationInCompany	                                specialties
personTimestamp	                                phone
personLinkedinUrl	                                minRevenue
personSalesUrl	                                maxRevenue
companyName_fromP	                    growth6Mth
companyLinkedinUrl_fromP	                    growth1Yr
companySalesUrl_fromP	                    growth2Yr
email	                                                       companyTimestampSN
email_validation	                               companyTimestampLN
validation_succes	                               linkedInCompanyUrl
firstName_cleaned	                               salesNavigatorCompanyUrl
lastName_cleaned			

Versión de box 1
Para cada prompt: versión del prompt (v…), user prompt, output 
Tema filtros pues hit o no fit o drop etc
Key de estado por paso (tipo preparado, enviado etc)
Key de respuesta y conversion de instantly 






Verification input:

LeadNumber	
TargetID	
firstName	
lastName	
personTitle	
personTitleDescription	
personSummary	
personLocation	
durationInRole	
durationInCompany	
personTimestamp	
personLinkedinUrl	
personSalesUrl	
companyName_fromP	
companyLinkedinUrl_fromP	
companySalesUrl_fromP





CompScrap Input:

LeadNumber	
TargetID	
firstName	
lastName	
personTitle	
personTitleDescription	
personSummary	
personLocation	
durationInRole	
durationInCompany	
personTimestamp	
personLinkedinUrl	
personSalesUrl	
companyName_fromP	
companyLinkedinUrl_fromP	
companySalesUrl_fromP	
email	
email_validation	
validation_succes	
firstName_cleaned	
lastName_cleaned




box1 input:

LeadNumber	                                             companyName
TargetID	                                             companyDescription
firstName	                                             companyTagLine
lastName	                                             industry
personTitle	                                             employeeCount
personTitleDescription	                     companyLocation
personSummary	                                 website
personLocation	                                 domain
durationInRole	                                            yearFounded
durationInCompany	                                specialties
personTimestamp	                                phone
personLinkedinUrl	                                minRevenue
personSalesUrl	                                maxRevenue
companyName_fromP	                    growth6Mth
companyLinkedinUrl_fromP	                    growth1Yr
companySalesUrl_fromP	                    growth2Yr
email	                                                       companyTimestampSN
email_validation	                               companyTimestampLN
validation_succes	                               linkedInCompanyUrl
firstName_cleaned	                               salesNavigatorCompanyUrl
lastName_cleaned			




input instantly:

LeadNumber
TargetID
firstName_cleaned
lastName_cleaned
Email
Body 1
Body 2
Body 3
Body 4

(de momento. Añadiremos más, como una especie de Leads Profile para tener acceso fácil en ventas, o a lo mejor lo guardamos en otro sitio)

















Perfecto. A continuación tienes la documentación operativa completa, redactada en español (España), pensada para que tu dev pueda diseñar el CRM y el backend sin inventar nada, solo con la lógica que tú has definido.
Está escrita como documentación de producto / sistema, no como notas sueltas.

Documentación del Sistema CRM AOS
Gestión de Leads, Inputs Manuales y Métricas Operativas

1. Objetivo del sistema
El objetivo de este CRM no es automatizar los pasos, sino facilitar la operación manual de cada fase del pipeline de leads, eliminando filtrados manuales, errores humanos y reprocesamientos.
El sistema actúa como:
Repositorio central (Master Table) de todos los leads y todos los outputs.


Generador automático de páginas de input para cada paso operativo.


Motor de métricas y ratios basado en estados reales del pipeline.


Herramienta de planificación para alimentar el sending schedule de Instantly.



2. Principios clave del diseño
Single Source of Truth

 Toda la información vive en una única tabla master.


Inputs derivados, no manuales

 Nunca se filtra manualmente la tabla master.

 El sistema genera automáticamente vistas (páginas de input) por paso.


Un lead solo puede pasar una vez por cada paso

 La condición “no se ha hecho este paso antes” es obligatoria en todos los inputs.


Estados explícitos, no inferidos

 Un lead no deja de ser input porque tenga columnas vacías, sino porque:


ha sido marcado como “enviado a X”


o “procesado por X”


Outputs siempre vuelven al Master

 Todo output (verificación, company scrap, box1, Instantly) se adjunta como nuevas columnas en la tabla master.



3. Arquitectura lógica del sistema
3.1 Estructura general
El sistema se compone de:
Tabla Master


Tablas / Vistas de Input por Paso


Dashboard


Zona de Almacenamiento (noHIT / FIT pero no usable)


Los pasos del pipeline son:
Export (Sales Navigator → Phantom)


Verification (email finder)


Company Scrap


Box 1 (procesamiento AOS)


Instantly (envío)



4. Paso 0 — Export (entrada al sistema)
Descripción
El export se realiza fuera del CRM:
Búsqueda en Sales Navigator


Scraping con Phantom


Output en Google Sheet


Conversión manual a CSV


Acción en el CRM
El usuario importa el CSV.


El sistema:


descarta columnas irrelevantes


renombra columnas


normaliza el esquema


Todos los leads entran en la tabla master.


Estado inicial del lead
No verificado


No enviado a ningún paso


Disponible para input de verificación



5. Tabla Master
Rol
Es la fuente única de verdad.
Nunca se opera directamente sobre ella.
Contiene:
Datos de persona


Datos de empresa


Datos de email


Outputs de company scrap


Outputs de box1


Estados de cada paso


Estados de Instantly


Versionado de box1


(El esquema exacto de columnas ya está definido en tu documento previo.)

6. Paso 1 — Verification (email finder)
Input: Página “Verification Input”
Un lead es input válido para verification si:
Está en el Master


NO ha sido enviado a verification antes


No importa si tendrá email o no: todos los leads pasan por aquí una sola vez.
Operación
El usuario entra en la página de input de verification.


El sistema muestra automáticamente los leads disponibles.


El usuario selecciona N leads (ej. 1.000).


Descarga CSV y los envía a verificación.


Estado al enviar
En el Master se marca:
verification_sent = true


verification_sent_at = timestamp


Output
El output de verificación (haya email o no):
Se importa al CRM.


Se adjunta al Master en nuevas columnas:


email


email_validation


validation_success


etc.



7. Paso 2 — Company Scrap
Input: Página “Company Scrap Input”
Un lead es input válido para company scrap si:
Tiene validation_success = true


NO ha sido enviado a company scrap antes


Que el scrap devuelva campos vacíos no invalida el paso.
El criterio es: se ha enviado y procesado, no qué datos salieron.
Operación
El sistema muestra todos los leads válidos (ej. 800).


El usuario decide cuántos procesar (ej. 500).


Descarga CSV.


Divide manualmente en varios sheets para varias cuentas Phantom.


Ejecuta los scrapes (puede tardar días).


Estado durante el proceso
company_scrap_sent = true


company_scrap_status = processing


Output
Cuando el output está listo:
Se importa al CRM.


Se adjunta al Master (campos de empresa).


Se marca:


company_scrap_status = completed


⚠️ Aunque algunos campos estén vacíos, el lead no debe volver a aparecer como input.

8. Paso 3 — Box 1 (procesamiento AOS)
Input: Página “Box1 Input”
Un lead es input válido para Box1 si:
Tiene company scrap completado


(implícitamente: tiene email verificado)


NO ha sido enviado a Box1 antes


Operación
El sistema muestra automáticamente los leads viables (ej. 500).


El usuario selecciona N (ej. 300).


Descarga CSV y los envía a Box1.


Estado al enviar
box1_sent = true


box1_version = v1


box1_sent_at = timestamp


Output
Box1 devuelve:
Subject


Bodies


Clasificación: HIT / noHIT / DROP


Se adjunta al Master:
Outputs de copy


Resultado del filtrado


Versión usada



9. Almacenamiento (FIT pero noHIT)
Leads que:
Pasan Box1


Son FIT


Pero no son HIT


Se marcan como:
storage = true


No vuelven a ningún input, pero:
Se conservan para futuros usos


Cuentan en métricas



10. Paso 4 — Instantly
Input: Página “Instantly Input”
Un lead es input válido para Instantly si:
Tiene Box1 completado


Es HIT


NO ha sido enviado a Instantly antes


Operación
El usuario descarga el input.


Lo sube a Instantly.


(Más adelante) la API de Instantly actualizará estados.


Estados posibles
sent


not contacted


contacted


positive reply


negative reply


converted


Estos estados se reflejan en el Master.

11. Dashboard
El dashboard no calcula desde el Master directamente, sino desde las páginas de input y estados, lo que garantiza coherencia.
Métricas principales
Leads totales


Leads disponibles por paso


Enviados por paso


Ratios reales (verification, scrap, FIT&HIT, respuesta, conversión)


Leads en almacenamiento


Zona de estimación
Basada en ratios actuales:
Estimación de leads que llegarán a Instantly


Estimación de respuestas


Estimación de conversiones


Días de feeding disponibles para Instantly según sending schedule


Esto permite decidir cuándo lanzar un nuevo export.

12. Valor clave del sistema
Este CRM:
Elimina filtrados manuales


Evita reprocesar leads


Centraliza outputs


Hace visible el pipeline real


Convierte operaciones caóticas en un sistema predecible


Es un chasis operativo, no una herramienta de scraping ni de envío.

Si quieres, el siguiente paso puede ser:
traducir esto a requisitos técnicos (backend + DB schema)


o definir exactamente los flags/booleans por paso


o diseñar cómo versionar Box1 a futuro (library / manus)





