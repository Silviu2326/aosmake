


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


