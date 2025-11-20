from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Datos simulados (pueden venir de una base de datos en el futuro)
data = {"Pendiente": 5, "Aprobada": 10, "Rechazada": 3, "Anulada": 2}

@app.route("/")
def home():
    return render_template("dashboard.html", data=data)

@app.route("/data")
def get_data():
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
