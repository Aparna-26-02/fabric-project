from flask import Flask, render_template, request, redirect
import subprocess
import qrcode
import uuid
import json

app = Flask(__name__)

FABRIC_PATH = "/workspaces/fabric-project/fabric-samples/test-network"

# --------- Fabric Environment Setup ---------
ENV_SETUP = f"""
export PATH={FABRIC_PATH}/../bin:$PATH
export FABRIC_CFG_PATH={FABRIC_PATH}/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE={FABRIC_PATH}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH={FABRIC_PATH}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
"""

def run_command(command):
    result = subprocess.run(
        command,
        shell=True,
        executable="/bin/bash",
        capture_output=True,
        text=True
    )
    return result.stdout + result.stderr


# -----------------------------
# Home
# -----------------------------
@app.route("/")
def index():
    return render_template("index.html")


# -----------------------------
# Farmer - Create Batch
# -----------------------------

@app.route("/farmer", methods=["GET", "POST"])
def farmer():
    if request.method == "POST":

        batchID = "BATCH-" + str(uuid.uuid4())[:8]
        farmer_name = request.form["farmer"]
        crop = request.form["crop"]
        quantity = request.form["quantity"]
        location = request.form["location"]
        temperature = request.form["temperature"]
        soilType = request.form["soilType"]

        cmd = f"""
cd {FABRIC_PATH}
{ENV_SETUP}
peer chaincode invoke -o localhost:7050 \
--ordererTLSHostnameOverride orderer.example.com \
--tls \
--cafile "{FABRIC_PATH}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
-C mychannel -n agri \
--peerAddresses localhost:7051 \
--tlsRootCertFiles "{FABRIC_PATH}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
--peerAddresses localhost:9051 \
--tlsRootCertFiles "{FABRIC_PATH}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
-c '{{"function":"CreateBatch","Args":["{batchID}","{farmer_name}","{crop}","{quantity}","{location}","{temperature}","{soilType}"]}}'
"""

        output = run_command(cmd)

        qr_data = f"https://turbo-dollop-q7rqr579gwrh46j5-5000.app.github.dev/consumer?batchID={batchID}"
        img = qrcode.make(qr_data)
        img.save(f"static/{batchID}.png")

        return render_template("result.html", result=output, qr=batchID, batchID=batchID)

    return render_template("farmer.html")
# -----------------------------
# Warehouse - Approve Quality
# -----------------------------
@app.route("/warehouse", methods=["GET", "POST"])
def warehouse():

    if request.method == "POST":

        batchID = request.form.get("batchID")
        grade = request.form.get("grade")

        # If grade submitted → approve
        if grade:
            cmd = f"""
cd {FABRIC_PATH}
{ENV_SETUP}
peer chaincode invoke -o localhost:7050 \
--ordererTLSHostnameOverride orderer.example.com \
--tls \
--cafile "{FABRIC_PATH}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
-C mychannel -n agri \
--peerAddresses localhost:7051 \
--tlsRootCertFiles "{FABRIC_PATH}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
--peerAddresses localhost:9051 \
--tlsRootCertFiles "{FABRIC_PATH}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
-c '{{"function":"ApproveQuality","Args":["{batchID}","{grade}"]}}'
"""
            output = run_command(cmd)
            return render_template("result.html", result=output)

        # Otherwise fetch batch details
        cmd = f"""
cd {FABRIC_PATH}
{ENV_SETUP}
peer chaincode query -C mychannel -n agri \
-c '{{"Args":["ReadBatch","{batchID}"]}}'
"""
        output = run_command(cmd)

        try:
            batch = json.loads(output)
        except:
            batch = None

        return render_template("warehouse.html", batch=batch, batchID=batchID)

    return render_template("warehouse.html")
#-------------------------------
# Buyer - Create PO
# -----------------------------
@app.route("/buyer", methods=["GET", "POST"])
def buyer():

    if request.method == "POST":

        batchID = request.form.get("batchID")
        price = request.form.get("price")
        buyer_name = request.form.get("buyer")

        # Step 2: Create PO
        if price:
            cmd = f"""
cd {FABRIC_PATH}
{ENV_SETUP}
peer chaincode invoke -o localhost:7050 \
--ordererTLSHostnameOverride orderer.example.com \
--tls \
--cafile "{FABRIC_PATH}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
-C mychannel -n agri \
--peerAddresses localhost:7051 \
--tlsRootCertFiles "{FABRIC_PATH}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
--peerAddresses localhost:9051 \
--tlsRootCertFiles "{FABRIC_PATH}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
-c '{{"function":"CreatePO","Args":["{batchID}","{buyer_name}","{price}"]}}'
"""
            run_command(cmd)

        # Fetch latest batch details
        cmd = f"""
cd {FABRIC_PATH}
{ENV_SETUP}
peer chaincode query -C mychannel -n agri \
-c '{{"Args":["ReadBatch","{batchID}"]}}'
"""
        output = run_command(cmd)

        try:
            batch = json.loads(output)
        except:
            batch = None

        return render_template("buyer.html", batch=batch, batchID=batchID)

    return render_template("buyer.html")
# -----------------------------
# Confirm Delivery
# -----------------------------
@app.route("/deliver/<batchID>")
def deliver(batchID):

    cmd = f"""
cd {FABRIC_PATH}
{ENV_SETUP}
peer chaincode invoke -o localhost:7050 \
--ordererTLSHostnameOverride orderer.example.com \
--tls \
--cafile "{FABRIC_PATH}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
-C mychannel -n agri \
--peerAddresses localhost:7051 \
--tlsRootCertFiles "{FABRIC_PATH}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
--peerAddresses localhost:9051 \
--tlsRootCertFiles "{FABRIC_PATH}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
-c '{{"function":"ConfirmDelivery","Args":["{batchID}"]}}'
"""
    run_command(cmd)

    return redirect(f"/consumer?batchID={batchID}")

# -----------------------------
# Consumer - View Batch (QR Compatible)
# -----------------------------
@app.route("/consumer", methods=["GET", "POST"])
def consumer():

    batchID = request.args.get("batchID") or request.form.get("batchID")

    if batchID:
        cmd = f"""
cd {FABRIC_PATH}
{ENV_SETUP}
peer chaincode query -C mychannel -n agri \
-c '{{"Args":["ReadBatch","{batchID}"]}}'
"""

        output = run_command(cmd)
        return render_template("consumer_result.html", result=output)

    return render_template("consumer.html")


# -----------------------------
# Regulator - Full Batch History
# -----------------------------
@app.route("/regulator", methods=["GET", "POST"])
def regulator():

    batchID = request.args.get("batchID") or request.form.get("batchID")

    if batchID:
        cmd = f"""
cd {FABRIC_PATH}
{ENV_SETUP}
peer chaincode query -C mychannel -n agri \
-c '{{"Args":["GetBatchHistory","{batchID}"]}}'
"""

        output = run_command(cmd)
        return render_template("regulator_result.html", result=output)

    return render_template("regulator.html")


if __name__ == "__main__":
    app.run(debug=True)