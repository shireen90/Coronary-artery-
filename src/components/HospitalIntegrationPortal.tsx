import { useState } from "react";
import { HOSPITAL_INTEGRATION_INFO, HL7_JSON_TEMPLATE } from "../data";
import { Terminal, Shield, ArrowRight, CheckCircle, Copy, Play } from "lucide-react";

export function HospitalIntegrationPortal() {
  const [copied, setCopied] = useState(false);
  const [payload, setPayload] = useState(HL7_JSON_TEMPLATE);
  const [simulationResponse, setSimulationResponse] = useState<any | null>(null);
  const [simulating, setSimulating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(HOSPITAL_INTEGRATION_INFO.apiEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = () => {
    setSimulating(true);
    setSimulationResponse(null);
    setTimeout(() => {
      try {
        const parsed = JSON.parse(payload);
        setSimulationResponse({
          status: "SUCCESS_200",
          transactionId: "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          timestamp: new Date().toISOString(),
          evaluationResult: {
            predictedRiskScore: "88%",
            priorityLevel: "CRITICAL_ALERT",
            routingDestination: "Coronary Care Unit (CCU) Registry",
            fhirDiagnosticReportId: "DiagRep-78942-CAD"
          },
          hl7Ack: "MSH|^~\\&|CAD_PREDICT_ENGINE|PORTAL_SERVER|EHR_EPIC|METROPOLITAN_HOSPITAL|20260630||ACK^R01^ACK|MSG-100293|P|2.5\nMSA|AA|MSG-100293|CAD Risk evaluation processed successfully."
        });
      } catch (err: any) {
        setSimulationResponse({
          status: "ERROR_400",
          timestamp: new Date().toISOString(),
          error: "Invalid FHIR Parameter Resource payload formatting: " + err.message
        });
      } finally {
        setSimulating(false);
      }
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left side: FHIR Security Credentials & Connection Status */}
      <div className="lg:col-span-1 bg-slate-900/60 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-medium text-slate-200 text-sm tracking-wide uppercase">
              HL7 / FHIR Gateway Credentials
            </h3>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            The CAD Risk Predictor implements OAuth 2.0 mutual-TLS client certificates and encrypted endpoints conforming strictly to HIPAA compliance protocols for secure EHR data exchange.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase block mb-1">
                Hospital System Identity
              </label>
              <div className="bg-slate-950 px-3 py-2 rounded text-xs font-mono border border-slate-900 text-slate-300">
                {HOSPITAL_INTEGRATION_INFO.hospitalName}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase block mb-1">
                Department Core Network
              </label>
              <div className="bg-slate-950 px-3 py-2 rounded text-xs font-mono border border-slate-900 text-slate-300">
                {HOSPITAL_INTEGRATION_INFO.departmentName}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase block mb-1">
                FHIR Base Access Endpoint
              </label>
              <div className="flex bg-slate-950 rounded border border-slate-900 overflow-hidden">
                <input
                  type="text"
                  readOnly
                  value={HOSPITAL_INTEGRATION_INFO.apiEndpoint}
                  className="bg-transparent text-[10px] font-mono text-slate-400 px-3 py-2 flex-grow focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="bg-slate-900 hover:bg-slate-800 border-l border-slate-900 text-slate-400 hover:text-slate-200 px-3 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase block mb-1">
                Developer Integration Bearer Token
              </label>
              <input
                type="password"
                readOnly
                value={HOSPITAL_INTEGRATION_INFO.authToken}
                className="w-full bg-slate-950 px-3 py-2 rounded text-xs font-mono border border-slate-900 text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">Gateway Secure</span>
          </div>
          <span className="text-slate-500">HL7 v2.5 / FHIR R4</span>
        </div>
      </div>

      {/* Right side: FHIR Playground simulation */}
      <div className="lg:col-span-2 bg-slate-900/60 rounded-xl border border-slate-800 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-sky-400" />
              <h3 className="font-display font-medium text-slate-200 text-sm tracking-wide uppercase">
                Active Integration Playground
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Simulate EHR Webhook Push</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input payload */}
            <div className="flex flex-col">
              <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase mb-2 block">
                FHIR Resource Parameter Payload (Editable JSON)
              </label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                className="w-full h-64 bg-slate-950 text-emerald-400 font-mono text-[10px] p-3 rounded-lg border border-slate-900 focus:outline-none focus:border-slate-800 resize-none leading-relaxed"
                spellCheck={false}
              />
              <button
                onClick={handleSimulate}
                disabled={simulating}
                className="mt-3 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 py-2 rounded-lg font-mono text-xs font-bold transition-all"
              >
                {simulating ? (
                  <>
                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-slate-950 border-t-transparent" />
                    Executing Secure handshake...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    POST to hospital Gateway
                  </>
                )}
              </button>
            </div>

            {/* Simulated response */}
            <div className="flex flex-col">
              <label className="text-[10px] font-mono font-semibold text-slate-500 uppercase mb-2 block">
                Gateway REST Response Log
              </label>
              <div className="bg-slate-950 text-sky-400 font-mono text-[10px] p-3 rounded-lg border border-slate-900 h-64 overflow-y-auto leading-relaxed">
                {simulationResponse ? (
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(simulationResponse, null, 2)}
                  </pre>
                ) : (
                  <div className="text-slate-600 flex flex-col items-center justify-center h-full text-center">
                    <ArrowRight className="w-6 h-6 mb-2 rotate-90 md:rotate-0 text-slate-700 animate-pulse" />
                    <span>Click 'POST to hospital Gateway' above to test the HL7 handshake.</span>
                  </div>
                )}
              </div>
              <div className="mt-3 text-[9px] text-slate-500 font-mono leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-900">
                <span className="text-slate-400 font-semibold block mb-0.5">Secure Tunnel Notes:</span>
                This gateway binds to the container proxy URL. Secure links can be embedded in clinical portals (such as Epic Epic App Orchard or Cerner Millenium) with standard iframe or single sign-on (SSO) credentials.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
