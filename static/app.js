document.addEventListener("DOMContentLoaded", () => {
    const noteInput = document.getElementById("note-input");
    const gutter = document.getElementById("gutter");
    const runBtn = document.getElementById("run-btn");
    const outputPane = document.getElementById("output-pane");
    const statusText = document.getElementById("status-text");

    function updateGutter() {
        const lines = noteInput.value.split("\n");
        const lineCount = lines.length || 1;
        gutter.innerHTML = Array(lineCount).fill("&gt;&gt;&gt;").join("<br>");
        gutter.scrollTop = noteInput.scrollTop;
    }

    noteInput.addEventListener("input", updateGutter);
    noteInput.addEventListener("scroll", () => {
        gutter.scrollTop = noteInput.scrollTop;
    });

    updateGutter();

    runBtn.addEventListener("click", async () => {
        const text = noteInput.value.trim();
        if (!text) {
            outputPane.innerHTML = `<div class="output-placeholder">> Error: Cannot analyze empty clinical note.</div>`;
            return;
        }

        runBtn.disabled = true;
        statusText.textContent = "STATUS: RUNNING INFERENCE...";
        outputPane.innerHTML = `<div class="output-placeholder">> Querying Ollama engine, awaiting structured response...</div>`;

        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: text })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Server returned code ${response.status}`);
            }

            const data = await response.json();
            renderAnalysis(data);
            statusText.textContent = "STATUS: IDLE";
        } catch (err) {
            outputPane.innerHTML = `<div class="output-placeholder" style="color: var(--danger)">> Execution error: ${escapeHtml(err.message)}</div>`;
            statusText.textContent = "STATUS: ERROR";
        } finally {
            runBtn.disabled = false;
        }
    });

    function renderAnalysis(data) {
        outputPane.innerHTML = "";

        // 1. Clinical Summary
        if (data.summary) {
            const sumSection = document.createElement("div");
            sumSection.className = "result-section";
            sumSection.innerHTML = `
                <div class="section-title">Clinical Summary</div>
                <div class="justification-text" style="color: var(--text-color);">${escapeHtml(data.summary)}</div>
            `;
            outputPane.appendChild(sumSection);
        }

        // 2. Differential Diagnoses Section (maps data.diag)
        const dxSection = document.createElement("div");
        dxSection.className = "result-section";
        
        let dxHtml = `<div class="section-title">Differential Diagnoses</div>`;
        if (data.diag && data.diag.length > 0) {
            dxHtml += data.diag.map(d => `
                <div class="diagnosis-entry">
                    <div class="condition-header">
                        <span class="condition-name">${escapeHtml(d.diag_name)}</span>
                        <span class="likelihood-badge likelihood-${escapeHtml((d.confidence || "").toLowerCase())}">${escapeHtml(d.confidence)} CONFIDENCE</span>
                    </div>

                    ${d.reason && d.reason.length ? `
                        <div style="margin-top: 6px;">
                            <span class="pane-label">CLINICAL REASONING:</span>
                            <ul class="bullet-list" style="margin-top: 4px;">
                                ${d.reason.map(r => `<li>${escapeHtml(r)}</li>`).join("")}
                            </ul>
                        </div>
                    ` : ""}

                    ${d.supporting_ev && d.supporting_ev.length ? `
                        <div style="margin-top: 6px;">
                            <span class="pane-label" style="color: var(--success);">SUPPORTING EVIDENCE:</span>
                            <ul class="bullet-list" style="margin-top: 4px;">
                                ${d.supporting_ev.map(ev => `<li>${escapeHtml(ev)}</li>`).join("")}
                            </ul>
                        </div>
                    ` : ""}

                    ${d.contradicting_ev && d.contradicting_ev.length ? `
                        <div style="margin-top: 6px;">
                            <span class="pane-label" style="color: var(--warning);">CONTRADICTING EVIDENCE:</span>
                            <ul class="bullet-list" style="margin-top: 4px;">
                                ${d.contradicting_ev.map(ev => `<li>${escapeHtml(ev)}</li>`).join("")}
                            </ul>
                        </div>
                    ` : ""}

                    ${d.symptoms_explained && d.symptoms_explained.length ? `
                        <div style="margin-top: 6px;">
                            <span class="pane-label">SYMPTOMS EXPLAINED:</span>
                            <ul class="bullet-list" style="margin-top: 4px;">
                                ${d.symptoms_explained.map(se => `<li>${escapeHtml(se)}</li>`).join("")}
                            </ul>
                        </div>
                    ` : ""}

                    ${d.symptoms_unexplained && d.symptoms_unexplained.length ? `
                        <div style="margin-top: 6px;">
                            <span class="pane-label" style="color: var(--danger);">SYMPTOMS UNEXPLAINED:</span>
                            <ul class="bullet-list" style="margin-top: 4px;">
                                ${d.symptoms_unexplained.map(su => `<li>${escapeHtml(su)}</li>`).join("")}
                            </ul>
                        </div>
                    ` : ""}

                    ${d.missing_ev && d.missing_ev.length ? `
                        <div style="margin-top: 6px;">
                            <span class="pane-label" style="color: var(--text-dim);">MISSING EVIDENCE:</span>
                            <ul class="bullet-list" style="margin-top: 4px;">
                                ${d.missing_ev.map(ev => `<li>${escapeHtml(ev)}</li>`).join("")}
                            </ul>
                        </div>
                    ` : ""}
                </div>
            `).join("");
        } else {
            dxHtml += `<div class="justification-text">No differential diagnoses generated.</div>`;
        }
        dxSection.innerHTML = dxHtml;
        outputPane.appendChild(dxSection);

        // 3. Recommended Actions Section (maps data.next_recs)
        if (data.next_recs && data.next_recs.length > 0) {
            const recSection = document.createElement("div");
            recSection.className = "result-section";
            recSection.innerHTML = `
                <div class="section-title">Recommended Clinical Next Steps</div>
                <ul class="bullet-list">
                    ${data.next_recs.map(act => `<li>${escapeHtml(act)}</li>`).join("")}
                </ul>
            `;
            outputPane.appendChild(recSection);
        }
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});