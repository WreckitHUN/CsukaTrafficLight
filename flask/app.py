from flask import Flask, request, jsonify, make_response
from pymodbus.client import ModbusTcpClient

# Server's IP port is default 502
local = '127.0.0.1'
PLC = '192.168.0.196'
offset = 16
byteCount = 1

app = Flask(__name__)
client = ModbusTcpClient(host=PLC)


@app.route('/')
def index():
    return ""


@app.route('/input', methods=["POST", "OPTIONS"])
def handle_inputs():
    # CORS
    if request.method == "OPTIONS":
        return build_cors_preflight_response()
    # CORS
    data = request.get_json()
    """
    {
    address: 0 ... 7,
    value: 0 or 1,
    }"""
    print(data)
    address = data["address"]
    value = data["value"]
    # Write coil
    client.write_coil(address=address + offset, value=value)
    # CORS
    response = jsonify(["OK"])
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route('/outputs', methods=["GET", "OPTIONS"])
def handle_outputs():
    # CORS
    if request.method == "OPTIONS":
        return build_cors_preflight_response()
    # CORS
    modbusResponse = client.read_discrete_inputs(
        address=0 + offset, count=byteCount * 8)
    if hasattr(modbusResponse, "bits"):
        response = jsonify(modbusResponse.bits)
    else:
        response = jsonify("disconnected")
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route('/readInputRegisters', methods=["GET", "OPTIONS"])
def handle_input_registers():
    # CORS
    if request.method == "OPTIONS":
        return build_cors_preflight_response()
    # CORS
    # TO DO..
    modbusResponse = client.read_input_registers(
        address=0, count=1)
    if hasattr(modbusResponse, "registers"):
        response = jsonify(modbusResponse.registers)
    else:
        response = jsonify("disconnected")
    response.headers.add("Access-Control-Allow-Origin", "*")
    print(modbusResponse)
    return response


def build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
