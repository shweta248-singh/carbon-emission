module.exports = {
  // 1. Project Overview & Pages
  pages: {
    overview: {
      en: "CarbonTrace is a supply chain tracker that helps manage inventory, optimize routes, and calculate carbon emissions.",
      hi: "CarbonTrace एक आपूर्ति श्रृंखला ट्रैकर है जो इन्वेंट्री प्रबंधित करने, मार्गों को अनुकूलित करने और कार्बन उत्सर्जन की गणना करने में मदद करता है।",
      es: "CarbonTrace es un rastreador de la cadena de suministro que ayuda a gestionar el inventario, optimizar rutas y calcular las emisiones de carbono."
    },
    dashboard: {
      en: "The Dashboard provides a high-level summary of your inventory, shipments, carbon emissions, and savings.",
      hi: "डैशबोर्ड आपके इन्वेंट्री, शिपमेंट, कार्बन उत्सर्जन और बचत का एक उच्च-स्तरीय सारांश प्रदान करता है।",
      es: "El Panel proporciona un resumen de alto nivel de su inventario, envíos, emisiones de carbono y ahorros."
    },
    operations_hub: {
      en: "Operations Hub is where you can quickly create shipments, manage inventory, and access route optimization.",
      hi: "ऑपरेशंस हब वह जगह है जहां आप जल्दी से शिपमेंट बना सकते हैं, इन्वेंट्री का प्रबंधन कर सकते हैं और मार्ग अनुकूलन तक पहुंच सकते हैं।",
      es: "El Centro de Operaciones es donde puede crear envíos rápidamente, administrar el inventario y acceder a la optimización de rutas."
    },
    inventory: {
      en: "Inventory page allows you to add, edit, and track products, quantities, and their locations (warehouses).",
      hi: "इन्वेंट्री पृष्ठ आपको उत्पादों, मात्राओं और उनके स्थानों (गोदामों) को जोड़ने, संपादित करने और ट्रैक करने की अनुमति देता है।",
      es: "La página de Inventario le permite agregar, editar y rastrear productos, cantidades y sus ubicaciones (almacenes)."
    },
    analytics: {
      en: "Analytics provides charts and detailed insights into your carbon footprint, eco-friendly transport usage, and overall efficiency.",
      hi: "एनालिटिक्स आपके कार्बन पदचिह्न, पर्यावरण के अनुकूल परिवहन उपयोग और समग्र दक्षता में चार्ट और विस्तृत अंतर्दृष्टि प्रदान करता है।",
      es: "Analytics proporciona gráficos e información detallada sobre su huella de carbono, el uso de transporte ecológico y la eficiencia general."
    },
    settings: {
      en: "Settings page allows you to set your default vehicle type, preferred carbon unit, and manage security preferences.",
      hi: "सेटिंग्स पृष्ठ आपको अपना डिफ़ॉल्ट वाहन प्रकार, पसंदीदा कार्बन इकाई सेट करने और सुरक्षा प्राथमिकताओं को प्रबंधित करने की अनुमति देता है।",
      es: "La página de Configuración le permite establecer su tipo de vehículo predeterminado, la unidad de carbono preferida y administrar las preferencias de seguridad."
    },
    login_register: {
      en: "Login/Register handles user authentication. You must register to create a secure, personalized workspace.",
      hi: "लॉगिन/रजिस्टर उपयोगकर्ता प्रमाणीकरण को संभालता है। आपको एक सुरक्षित, व्यक्तिगत कार्यक्षेत्र बनाने के लिए पंजीकरण करना होगा।",
      es: "El inicio de sesión/registro maneja la autenticación del usuario. Debe registrarse para crear un espacio de trabajo seguro y personalizado."
    }
  },

  // 2. Explanations & Form Fields
  fields: {
    product_id: {
      en: "Product ID (SKU) is a unique identifier for your inventory items (e.g., PROD-001).",
      hi: "उत्पाद आईडी (SKU) आपके इन्वेंट्री आइटम (जैसे, PROD-001) के लिए एक विशिष्ट पहचानकर्ता है।",
      es: "El ID de producto (SKU) es un identificador único para sus artículos de inventario (por ejemplo, PROD-001)."
    },
    shipment_form: {
      en: "Shipment form requires: Product, Origin City, Destination City, Distance (km), Vehicle Type, Fuel Type, Vehicle Number, Model, Driver Name, and Transport Company.",
      hi: "शिपमेंट फॉर्म के लिए आवश्यक है: उत्पाद, मूल शहर, गंतव्य शहर, दूरी (किमी), वाहन का प्रकार, ईंधन का प्रकार, वाहन संख्या, मॉडल, ड्राइवर का नाम और परिवहन कंपनी।",
      es: "El formulario de envío requiere: Producto, Ciudad de origen, Ciudad de destino, Distancia (km), Tipo de vehículo, Tipo de combustible, Número de vehículo, Modelo, Nombre del conductor y Compañía de transporte."
    }
  },

  // 3. Examples
  examples: {
    inventory: {
      en: "Example to add inventory:\nProduct Name: Organic Wheat\nProduct ID: WH-101\nQuantity: 500\nCategory: Food Grains\nWarehouse: Delhi Central",
      hi: "इन्वेंट्री जोड़ने का उदाहरण:\nउत्पाद का नाम: ऑर्गेनिक गेहूं\nउत्पाद आईडी: WH-101\nमात्रा: 500\nश्रेणी: खाद्यान्न\nगोदाम: दिल्ली सेंट्रल",
      es: "Ejemplo para agregar inventario:\nNombre del producto: Trigo orgánico\nID del producto: WH-101\nCantidad: 500\nCategoría: Granos de alimentos\nAlmacén: Centro de Madrid"
    },
    shipment: {
      en: "Example to fill shipment form:\nProduct: Wheat\nOrigin City: Lucknow\nDestination City: Mumbai\nDistance: 1625\nVehicle Type: Truck\nFuel Type: Diesel\nVehicle Number: UP32 AB 1234\nVehicle Model: Tata Signa 5530\nDriver Name: Ravi Kumar\nTransport Company: ABC Logistics",
      hi: "शिपमेंट फॉर्म भरने का उदाहरण:\nउत्पाद: गेहूं\nमूल शहर: लखनऊ\nगंतव्य शहर: मुंबई\nदूरी: 1625\nवाहन का प्रकार: ट्रक\nईंधन का प्रकार: डीजल\nवाहन संख्या: UP32 AB 1234\nवाहन मॉडल: Tata Signa 5530\nड्राइवर का नाम: रवि कुमार\nपरिवहन कंपनी: एबीसी लॉजिस्टिक्स",
      es: "Ejemplo para completar el formulario de envío:\nProducto: Trigo\nCiudad de origen: Lucknow\nCiudad de destino: Mumbai\nDistancia: 1625\nTipo de vehículo: Camión\nTipo de combustible: Diésel\nNúmero de vehículo: UP32 AB 1234\nModelo del vehículo: Tata Signa 5530\nNombre del conductor: Ravi Kumar\nEmpresa de transporte: ABC Logistics"
    }
  },

  // 4. Calculations & Logic
  calculations: {
    carbon_formula: {
      en: "Carbon Emission = Distance (km) * Emission Factor of the Vehicle (kg CO2/km).",
      hi: "कार्बन उत्सर्जन = दूरी (किमी) * वाहन का उत्सर्जन कारक (किग्रा CO2/किमी)।",
      es: "Emisión de carbono = Distancia (km) * Factor de emisión del vehículo (kg CO2/km)."
    },
    vehicle_factors: {
      en: "Vehicle emission factors (kg CO2/km): Car (0.192), Bike (0.103), Truck (0.833), Ship (0.016), Rail (0.041), Air Cargo (2.5).",
      hi: "वाहन उत्सर्जन कारक (किग्रा CO2/किमी): कार (0.192), बाइक (0.103), ट्रक (0.833), जहाज (0.016), रेल (0.041), एयर कार्गो (2.5)।",
      es: "Factores de emisión de vehículos (kg CO2/km): Coche (0.192), Bicicleta (0.103), Camión (0.833), Barco (0.016), Ferrocarril (0.041), Carga aérea (2.5)."
    },
    route_optimization: {
      en: "Route optimization finds the shortest path using ORS (OpenRouteService) and suggests lower-emission vehicles to maximize CO2 savings.",
      hi: "मार्ग अनुकूलन ORS (OpenRouteService) का उपयोग करके सबसे छोटा रास्ता खोजता है और CO2 बचत को अधिकतम करने के लिए कम उत्सर्जन वाले वाहनों का सुझाव देता है।",
      es: "La optimización de rutas encuentra el camino más corto utilizando ORS (OpenRouteService) y sugiere vehículos de bajas emisiones para maximizar el ahorro de CO2."
    }
  },

  // 5. Tech Stack & Integration
  tech: {
    ors_api: {
      en: "ORS (OpenRouteService) API is used for geocoding city names to coordinates and calculating the optimal driving route and distance.",
      hi: "ORS (OpenRouteService) API का उपयोग शहर के नामों को निर्देशांक में जियोकोड करने और इष्टतम ड्राइविंग मार्ग और दूरी की गणना करने के लिए किया जाता है।",
      es: "La API ORS (OpenRouteService) se utiliza para geocodificar nombres de ciudades a coordenadas y calcular la ruta de conducción óptima y la distancia."
    },
    sendgrid: {
      en: "SendGrid is used to send email notifications for critical alerts, such as when your inventory stock falls below the minimum threshold.",
      hi: "SendGrid का उपयोग महत्वपूर्ण अलर्ट के लिए ईमेल सूचनाएं भेजने के लिए किया जाता है, जैसे कि जब आपकी इन्वेंट्री स्टॉक न्यूनतम सीमा से नीचे आती है।",
      es: "SendGrid se utiliza para enviar notificaciones por correo electrónico de alertas críticas, como cuando su inventario cae por debajo del umbral mínimo."
    },
    security: {
      en: "Security features include JWT authentication, express-rate-limit to prevent abuse, helmet for HTTP headers, and mongo-sanitize to prevent NoSQL injection.",
      hi: "सुरक्षा सुविधाओं में JWT प्रमाणीकरण, दुर्व्यवहार को रोकने के लिए एक्सप्रेस-रेट-लिमिट, HTTP हेडर के लिए हेलमेट, और NoSQL इंजेक्शन को रोकने के लिए मोंगो-सैनिटाइज़ शामिल हैं।",
      es: "Las funciones de seguridad incluyen autenticación JWT, límite de velocidad express para evitar abusos, casco para encabezados HTTP y mongo-sanitize para prevenir la inyección NoSQL."
    }
  },

  // 6. Troubleshooting & Deployment
  troubleshooting: {
    common_errors: {
      en: "Common Errors: 1. 'Fuel Type enum mismatch' - ensure your UI label maps to the exact English backend enum. 2. '500 Server Error' on shipments - verify backend Python optimization engine is running.",
      hi: "सामान्य त्रुटियां: 1. 'ईंधन प्रकार एनम बेमेल' - सुनिश्चित करें कि आपका यूआई लेबल सटीक अंग्रेजी बैकएंड एनम से मैप करता है। 2. शिपमेंट पर '500 सर्वर त्रुटि' - सत्यापित करें कि बैकएंड पायथन अनुकूलन इंजन चल रहा है।",
      es: "Errores comunes: 1. 'Desajuste de enumeración de tipo de combustible': asegúrese de que la etiqueta de la interfaz de usuario se asigne a la enumeración exacta del backend en inglés. 2. 'Error de servidor 500' en envíos: verifique que el motor de optimización de Python del backend esté funcionando."
    },
    postman: {
      en: "To test with Postman: 1. Login via /api/auth/login and copy the JWT token. 2. Set 'Authorization: Bearer <token>' in the headers for all protected endpoints.",
      hi: "Postman के साथ परीक्षण करने के लिए: 1. /api/auth/login के माध्यम से लॉगिन करें और JWT टोकन कॉपी करें। 2. सभी संरक्षित एंडपॉइंट्स के लिए हेडर में 'Authorization: Bearer <token>' सेट करें।",
      es: "Para probar con Postman: 1. Inicie sesión a través de /api/auth/login y copie el token JWT. 2. Configure 'Authorization: Bearer <token>' en los encabezados para todos los puntos finales protegidos."
    },
    deployment: {
      en: "Deployment notes: The frontend is built with Vite and should be served statically. The Node backend should be run with PM2. Ensure MongoDB URI and SendGrid API keys are set in production environment variables.",
      hi: "परिनियोजन नोट्स: फ्रंटएंड वाइट के साथ बनाया गया है और इसे स्थिर रूप से परोसा जाना चाहिए। नोड बैकएंड को PM2 के साथ चलाया जाना चाहिए। सुनिश्चित करें कि MongoDB URI और SendGrid API कुंजियां उत्पादन परिवेश चर में सेट हैं।",
      es: "Notas de implementación: El frontend está construido con Vite y debe servirse estáticamente. El backend del nodo debe ejecutarse con PM2. Asegúrese de que el URI de MongoDB y las claves de API de SendGrid estén configuradas en las variables de entorno de producción."
    }
  },

  // 7. Environmental Knowledge + Carbon Concepts
  environmental: {
    greenhouse_gases: {
      en: "Greenhouse gases trap heat in the atmosphere. The main ones are Carbon Dioxide (CO2), Methane (CH4), and Nitrous Oxide (N2O). Why? Because human activities like burning fossil fuels release them, causing global warming.\n\nExample: CO2 from cars, CH4 from agriculture.",
      hi: "ग्रीनहाउस गैसें वायुमंडल में गर्मी को फंसाती हैं। मुख्य गैसें कार्बन डाइऑक्साइड (CO2), मीथेन (CH4), और नाइट्रस ऑक्साइड (N2O) हैं। क्यों? क्योंकि जीवाश्म ईंधन जलाने जैसी मानवीय गतिविधियां उन्हें छोड़ती हैं, जिससे ग्लोबल वार्मिंग होती है।\n\nउदाहरण: कारों से CO2, कृषि से CH4।",
      es: "Los gases de efecto invernadero atrapan el calor en la atmósfera. Los principales son el dióxido de carbono (CO2), el metano (CH4) y el óxido nitroso (N2O). ¿Por qué? Porque las actividades humanas, como la quema de combustibles fósiles, los liberan, causando el calentamiento global.\n\nEjemplo: CO2 de los coches, CH4 de la agricultura."
    },
    emission_sources: {
      en: "Emissions come from multiple sources, not just vehicles. Why? Because producing energy, manufacturing goods, and farming all require processes that release gases.\n\nSources:\n- Transport: Cars, trucks, airplanes\n- Industry: Manufacturing, construction\n- Energy: Power plants\n- Agriculture: Livestock, fertilizers",
      hi: "उत्सर्जन कई स्रोतों से आते हैं, न कि केवल वाहनों से। क्यों? क्योंकि ऊर्जा उत्पादन, माल निर्माण और खेती सभी में ऐसी प्रक्रियाओं की आवश्यकता होती है जो गैसें छोड़ती हैं।\n\nस्रोत:\n- परिवहन: कारें, ट्रक, हवाई जहाज\n- उद्योग: विनिर्माण, निर्माण\n- ऊर्जा: बिजली संयंत्र\n- कृषि: पशुधन, उर्वरक",
      es: "Las emisiones provienen de múltiples fuentes, no solo de los vehículos. ¿Por qué? Porque la producción de energía, la fabricación de bienes y la agricultura requieren procesos que liberan gases.\n\nFuentes:\n- Transporte: Coches, camiones, aviones\n- Industria: Fabricación, construcción\n- Energía: Centrales eléctricas\n- Agricultura: Ganadería, fertilizantes"
    },
    emission_comparison: {
      en: "Different transport modes have varying emissions. Why? Due to differences in fuel efficiency and load capacity.\n\n| Mode | Emission (kg CO2/km) |\n|---|---|\n| Air | High (~2.5) |\n| Road | Medium (~0.8) |\n| Rail | Low (~0.04) |\n| Ship | Very Low (~0.01) |",
      hi: "विभिन्न परिवहन मोड में अलग-अलग उत्सर्जन होते हैं। क्यों? ईंधन दक्षता और भार क्षमता में अंतर के कारण।\n\n| मोड | उत्सर्जन (kg CO2/km) |\n|---|---|\n| वायु | उच्च (~2.5) |\n| सड़क | मध्यम (~0.8) |\n| रेल | निम्न (~0.04) |\n| जहाज | बहुत निम्न (~0.01) |",
      es: "Los diferentes modos de transporte tienen emisiones variables. ¿Por qué? Debido a las diferencias en la eficiencia del combustible y la capacidad de carga.\n\n| Modo | Emisión (kg CO2/km) |\n|---|---|\n| Aire | Alto (~2.5) |\n| Carretera | Medio (~0.8) |\n| Ferrocarril | Bajo (~0.04) |\n| Barco | Muy bajo (~0.01) |"
    },
    sustainability_strategies: {
      en: "Strategies to reduce emissions include switching to renewable energy and improving efficiency. Why? Renewable energy (solar, wind) generates no direct emissions, while efficiency reduces the total energy needed.\n\nStrategies:\n1. Use electric vehicles\n2. Optimize routes\n3. Switch to solar/wind power\n4. Reduce waste",
      hi: "उत्सर्जन कम करने की रणनीतियों में नवीकरणीय ऊर्जा की ओर रुख करना और दक्षता में सुधार करना शामिल है। क्यों? नवीकरणीय ऊर्जा (सौर, पवन) कोई प्रत्यक्ष उत्सर्जन उत्पन्न नहीं करती है, जबकि दक्षता आवश्यक कुल ऊर्जा को कम करती है।\n\nरणनीतियाँ:\n1. इलेक्ट्रिक वाहनों का उपयोग करें\n2. मार्गों को अनुकूलित करें\n3. सौर/पवन ऊर्जा पर स्विच करें\n4. कचरा कम करें",
      es: "Las estrategias para reducir las emisiones incluyen el cambio a energías renovables y la mejora de la eficiencia. ¿Por qué? La energía renovable (solar, eólica) no genera emisiones directas, mientras que la eficiencia reduce la energía total necesaria.\n\nEstrategias:\n1. Utilizar vehículos eléctricos\n2. Optimizar rutas\n3. Cambiar a energía solar/eólica\n4. Reducir los residuos"
    },
    climate_change_basics: {
      en: "Climate change refers to long-term shifts in temperatures and weather patterns. Why? Driven mainly by human activities like burning fossil fuels, which increase greenhouse gases in the Earth's atmosphere.",
      hi: "जलवायु परिवर्तन तापमान और मौसम के पैटर्न में दीर्घकालिक बदलाव को संदर्भित करता है। क्यों? मुख्य रूप से जीवाश्म ईंधन जलाने जैसी मानवीय गतिविधियों से प्रेरित है, जो पृथ्वी के वायुमंडल में ग्रीनहाउस गैसों को बढ़ाते हैं।",
      es: "El cambio climático se refiere a los cambios a largo plazo en las temperaturas y los patrones climáticos. ¿Por qué? Impulsado principalmente por actividades humanas como la quema de combustibles fósiles, que aumentan los gases de efecto invernadero en la atmósfera de la Tierra."
    },
    carbon_emissions: {
      en: "Carbon emissions refer to the release of carbon dioxide (CO2) and other greenhouse gases into the atmosphere. Why? This happens due to burning fossil fuels and other human activities. In CarbonTrace, you can track and reduce these emissions for your supply chain.",
      hi: "कार्बन उत्सर्जन से तात्पर्य कार्बन डाइऑक्साइड (CO2) और अन्य ग्रीनहाउस गैसों के वायुमंडल में जारी होने से है। क्यों? यह जीवाश्म ईंधन जलाने और अन्य मानवीय गतिविधियों के कारण होता है। CarbonTrace में, आप अपनी आपूर्ति श्रृंखला के लिए इन उत्सर्जनों को ट्रैक और कम कर सकते हैं।",
      es: "Las emisiones de carbono se refieren a la liberación de dióxido de carbono (CO2) y otros gases de efecto invernadero a la atmósfera. ¿Por qué? Esto sucede debido a la quema de combustibles fósiles y otras actividades humanas. En CarbonTrace, puede rastrear y reducir estas emisiones para su cadena de suministro."
    }
  },

  // 8. System Messages
  system: {
    unrelated_reply: {
      en: "I can only answer questions related to CarbonTrace, supply chain management, or environmental and carbon concepts.",
      hi: "मैं केवल CarbonTrace, आपूर्ति श्रृंखला प्रबंधन, या पर्यावरण और कार्बन अवधारणाओं से संबंधित प्रश्नों के उत्तर दे सकता हूँ।",
      es: "Solo puedo responder preguntas relacionadas con CarbonTrace, la gestión de la cadena de suministro o conceptos ambientales y de carbono."
    },
    low_confidence_reply: {
      en: "I am not confident enough. Please ask a CarbonTrace-related question.",
      hi: "मैं पर्याप्त आश्वस्त नहीं हूँ। कृपया CarbonTrace से संबंधित प्रश्न पूछें।",
      es: "No tengo la suficiente confianza. Por favor, haga una pregunta relacionada con CarbonTrace."
    }
  }
};
