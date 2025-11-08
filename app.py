import os
import google.generativeai as genai
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_cors import CORS

# Cargar las variables de entorno del archivo .env
load_dotenv()

# --- Configuración de la API de Gemini ---
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Inicializamos la aplicación de Flask
app = Flask(__name__)
CORS(app)

# --- Rutas de la API ---
@app.route('/api/process', methods=['POST'])
def process_data():
    data = request.get_json()
    if not data or 'prompt' not in data:
        return jsonify({"error": "No se recibió un 'prompt' en la solicitud."}), 400
    
    prompt = data['prompt']
    
    try:
        # Inicializamos el modelo que estamos usando
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # --- AJUSTE CLAVE: Configuración de Generación ---
        # Le decimos a la IA que sea muy determinista (poca creatividad)
        generation_config = genai.types.GenerationConfig(
            temperature=0.0 
        )
        # -----------------------------------------------
        
        # Enviamos el prompt al modelo con la nueva configuración
        response = model.generate_content(
            prompt,
            generation_config=generation_config
        )
        
        return jsonify({"response": response.text})
        
    except Exception as e:
        # Imprimimos el error en la terminal del backend para depuración
        print(f"Error al contactar la API de Gemini: {e}")
        return jsonify({"error": "Hubo un problema al procesar la solicitud con la IA."}), 500

# --- Ejecución de la Aplicación ---
if __name__ == '__main__':
    app.run(debug=True)