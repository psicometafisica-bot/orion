import os
import google.generativeai as genai
from dotenv import load_dotenv
import traceback # Importamos esta librería para ver el error completo

try:
    print("--- Iniciando prueba de Gemini ---")

    # 1. Cargar el archivo .env
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("No se encontró la GEMINI_API_KEY en el archivo .env")

    print("API Key encontrada. Configurando...")

    # 2. Configurar la API de Gemini
    genai.configure(api_key=api_key)

    print("Configuración exitosa. Inicializando modelo 'gemini-1.5-flash'...")

    # 3. Usar el modelo 'gemini-1.5-flash' (basado en tu pista)
    model = genai.GenerativeModel('gemini-1.5-flash')

    print("Modelo inicializado. Enviando pregunta...")

    # 4. Enviar una pregunta
    prompt = "¿Cuál es la capital de Argentina?"
    response = model.generate_content(prompt)

    print("\n--- ¡ÉXITO! ---")
    print("La respuesta de Gemini es:")
    print(response.text)

except Exception as e:
    print("\n--- ¡ERROR DETECTADO! ---")
    print("Se ha producido un error. Aquí está el informe completo:")
    # Imprimimos el error detallado que Flask estaba ocultando
    traceback.print_exc()