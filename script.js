// Mapeamento de meses
const meses = {
    1: 'jan', 2: 'fev', 3: 'mar', 4: 'abr', 5: 'mai', 6: 'jun',
    7: 'jul', 8: 'ago', 9: 'set', 10: 'out', 11: 'nov', 12: 'dez'
};

// Elementos do DOM
const nfFile = document.getElementById('nfFile');
const nfXmlFile = document.getElementById('nfXmlFile');
const boletoFile = document.getElementById('boletoFile');
const nfNumero = document.getElementById('nfNumero');
const nfDataEmissao = document.getElementById('nfDataEmissao');
const nfCompetencia = document.getElementById('nfCompetencia');
const nfValor = document.getElementById('nfValor');
const boletoCompetencia = document.getElementById('boletoCompetencia');
const boletoVencimento = document.getElementById('boletoVencimento');
const boletoValor = document.getElementById('boletoValor');
const convertBtn = document.getElementById('convertBtn');
const nfPreview = document.getElementById('nfPreview');
const boletoPreview = document.getElementById('boletoPreview');
const messages = document.getElementById('messages');

// Obter último dia do mês anterior
function getLastDayOfPreviousMonth() {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    const mesAnterior = new Date(ontem.getFullYear(), ontem.getMonth() - 1, 1);
    const ultimoDia = new Date(mesAnterior.getFullYear(), mesAnterior.getMonth() + 1, 0);
    const dia = String(ultimoDia.getDate()).padStart(2, '0');
    const mes = String(ultimoDia.getMonth() + 1).padStart(2, '0');
    const ano = ultimoDia.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

// Inicializar data de competência padrão (mês anterior ao de ontem)
function getDefaultCompetencia() {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    const mesAnterior = new Date(ontem.getFullYear(), ontem.getMonth() - 1, 1);
    const mes = meses[mesAnterior.getMonth() + 1];
    const ano = mesAnterior.getFullYear().toString().slice(-2);
    return `${mes}/${ano}`;
}

// Extrair competência de uma data (dd/mm/aaaa)
function getCompetenciaFromDate(dateStr) {
    const parts = dateStr.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
        const mes = parseInt(parts[1]);
        const ano = parts[2].slice(-2);
        if (mes >= 1 && mes <= 12) {
            return `${meses[mes]}/${ano}`;
        }
    }
    return null;
}

// Preencher competência padrão e data da competência
function initCompetencia() {
    const defaultComp = getDefaultCompetencia();
    nfCompetencia.value = defaultComp;
    boletoCompetencia.value = defaultComp;
    // Preencher data da competência com último dia do mês anterior
    nfDataEmissao.value = getLastDayOfPreviousMonth();
}

// Sincronizar competência da NF para o boleto
nfCompetencia.addEventListener('input', () => {
    boletoCompetencia.value = nfCompetencia.value;
    updateBoletoPreview();
});

// Função para atualizar competência (mes/YY) baseada na data da competência (dd/mm/aaaa)
function atualizarCompetenciaDaData() {
    const dataCompetencia = nfDataEmissao.value.trim();
    if (dataCompetencia) {
        const competencia = getCompetenciaFromDate(dataCompetencia);
        if (competencia) {
            nfCompetencia.value = competencia;
            boletoCompetencia.value = competencia;
            // Atualizar previews após mudar a competência
            updateNFPreview();
            updateBoletoPreview();
        }
    }
}

// Quando a data da competência mudar e perder o foco, atualizar competência (mes/YY)
nfDataEmissao.addEventListener('blur', atualizarCompetenciaDaData);

// Quando pressionar Enter no campo de data da competência, atualizar competência (mes/YY)
nfDataEmissao.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevenir comportamento padrão do Enter
        atualizarCompetenciaDaData();
        nfDataEmissao.blur(); // Remover foco do campo
    }
});

// Função para replicar valor da NF no boleto
function replicarValorNF() {
    const valorNF = nfValor.value.trim();
    if (valorNF) {
        boletoValor.value = valorNF;
        updateBoletoPreview();
    }
}

// Quando o valor da NF mudar e perder o foco, replicar no boleto
nfValor.addEventListener('blur', replicarValorNF);

// Quando pressionar Enter no campo de valor da NF, replicar no boleto
nfValor.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevenir comportamento padrão do Enter
        replicarValorNF();
        nfValor.blur(); // Remover foco do campo
    }
});

// Formatar valor (máscara)
function formatValor(input) {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/[^\d,]/g, '');
        if (value.includes(',')) {
            const parts = value.split(',');
            if (parts[1] && parts[1].length > 2) {
                value = parts[0] + ',' + parts[1].substring(0, 2);
            }
        }
        e.target.value = value;
    });
}

formatValor(nfValor);
formatValor(boletoValor);

// Formatar data (dd/mm/aaaa) - versão simplificada que permite edição livre
function formatData(input) {
    input.addEventListener('input', (e) => {
        let value = e.target.value;
        const cursorPos = e.target.selectionStart;
        
        // Remover tudo que não é dígito
        let digitsOnly = value.replace(/\D/g, '');
        
        // Limitar a 8 dígitos (ddmmaaaa)
        if (digitsOnly.length > 8) {
            digitsOnly = digitsOnly.substring(0, 8);
        }
        
        // Formatar com barras
        let formatted = '';
        for (let i = 0; i < digitsOnly.length; i++) {
            if (i === 2 || i === 4) {
                formatted += '/';
            }
            formatted += digitsOnly[i];
        }
        
        // Atualizar valor
        e.target.value = formatted;
        
        // Ajustar cursor - posição relativa aos dígitos
        setTimeout(() => {
            // Contar quantos dígitos existem antes da posição do cursor no valor antigo
            const digitsBeforeCursor = value.substring(0, cursorPos).replace(/\D/g, '').length;
            
            // Encontrar a posição equivalente no novo valor formatado
            let newPos = 0;
            let digitCount = 0;
            for (let i = 0; i < formatted.length; i++) {
                if (formatted[i] !== '/') {
                    digitCount++;
                }
                if (digitCount >= digitsBeforeCursor) {
                    newPos = i + 1;
                    break;
                }
            }
            
            // Se não encontrou (cursor estava no final), colocar no final
            if (digitCount < digitsBeforeCursor) {
                newPos = formatted.length;
            }
            
            // Garantir limites
            newPos = Math.min(Math.max(0, newPos), formatted.length);
            e.target.setSelectionRange(newPos, newPos);
        }, 0);
    });
}

formatData(nfDataEmissao);
formatData(boletoVencimento);

// Atualizar preview da NF quando arquivo for selecionado
nfFile.addEventListener('change', () => {
    updateNFPreview();
});

// Extrair informações do XML da NF
async function extractDataFromXML(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const xmlText = e.target.result;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                
                // Verificar se há erros de parsing
                const parseError = xmlDoc.querySelector('parsererror');
                if (parseError) {
                    reject(new Error('Erro ao fazer parse do XML'));
                    return;
                }
                
                // Extrair dados do XML
                // O XML tem namespace, então precisamos usar getElementsByTagName ou querySelector com namespace
                const nNFSe = xmlDoc.getElementsByTagName('nNFSe')[0]?.textContent;
                const dCompet = xmlDoc.getElementsByTagName('dCompet')[0]?.textContent;
                const vServ = xmlDoc.getElementsByTagName('vServ')[0]?.textContent;
                const vLiq = xmlDoc.getElementsByTagName('vLiq')[0]?.textContent;
                
                // Converter data de competência de YYYY-MM-DD para dd/mm/aaaa (para o campo de data)
                let dataCompetencia = null;
                let competencia = null;
                if (dCompet) {
                    const dateParts = dCompet.split('-');
                    if (dateParts.length === 3) {
                        // Converter para dd/mm/aaaa
                        const dia = dateParts[2].padStart(2, '0');
                        const mes = dateParts[1].padStart(2, '0');
                        const ano = dateParts[0];
                        dataCompetencia = `${dia}/${mes}/${ano}`;
                        
                        // Também converter para mes/YY (para o campo de competência)
                        const anoInt = parseInt(dateParts[0]);
                        const mesInt = parseInt(dateParts[1]);
                        const mesAbrev = meses[mesInt];
                        const anoAbrev = anoInt.toString().slice(-2);
                        competencia = `${mesAbrev}/${anoAbrev}`;
                    }
                }
                
                // Usar vLiq se disponível, senão vServ
                const valor = vLiq || vServ;
                
                resolve({
                    numero: nNFSe,
                    competencia: competencia,
                    dataCompetencia: dataCompetencia,
                    valor: valor ? parseFloat(valor).toFixed(2).replace('.', ',') : null
                });
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('Erro ao ler arquivo XML'));
        reader.readAsText(file);
    });
}

nfXmlFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    showMessage('Processando XML da NF...', 'info');
    
    try {
        const data = await extractDataFromXML(file);
        
        // Preencher todos os campos, substituindo valores existentes
        if (data.numero) {
            nfNumero.value = data.numero;
        }
        
        // Preencher data da competência (dd/mm/aaaa)
        if (data.dataCompetencia) {
            nfDataEmissao.value = data.dataCompetencia;
        }
        
        // Preencher competência (mes/YY)
        if (data.competencia) {
            nfCompetencia.value = data.competencia;
            boletoCompetencia.value = data.competencia;
        } else if (data.dataCompetencia) {
            // Se não tem competência mes/YY mas tem data, calcular da data
            atualizarCompetenciaDaData();
        }
        
        if (data.valor) {
            nfValor.value = data.valor;
            boletoValor.value = data.valor;
        }
        
        showMessage('Dados extraídos do XML com sucesso! Revise os campos.', 'success');
        updateNFPreview();
        updateBoletoPreview();
    } catch (error) {
        console.error('Erro ao processar XML:', error);
        showMessage('Não foi possível extrair dados do XML. Preencha os campos manualmente.', 'warning');
    }
});

// Atualizar preview do boleto quando arquivo for selecionado
boletoFile.addEventListener('change', () => {
    updateBoletoPreview();
});

// Formatar valor para garantir ",00" se não tiver decimais
function formatarValor(valor) {
    if (!valor) return '';
    let valorFormatado = valor.trim();
    
    // Se não tem vírgula, adicionar ",00"
    if (!valorFormatado.includes(',')) {
        valorFormatado = valorFormatado + ',00';
    } else {
        // Se tem vírgula, garantir 2 casas decimais
        const parts = valorFormatado.split(',');
        if (parts[1]) {
            // Se tem decimais, garantir 2 casas
            if (parts[1].length === 1) {
                valorFormatado = parts[0] + ',' + parts[1] + '0';
            } else if (parts[1].length > 2) {
                valorFormatado = parts[0] + ',' + parts[1].substring(0, 2);
            }
        } else {
            // Vírgula sem decimais, adicionar 00
            valorFormatado = valorFormatado + '00';
        }
    }
    
    return valorFormatado;
}

// Limpar e formatar competência (remover underscores, espaços e barras)
function formatarCompetencia(competencia) {
    if (!competencia) return '';
    // Remover underscores, barras, espaços e formatar para mesYY
    return competencia.trim().replace(/_/g, '').replace(/\//g, '').replace(/\s+/g, '');
}

// Atualizar preview da NF
function updateNFPreview() {
    const numero = nfNumero.value.trim();
    const dataCompetencia = nfDataEmissao.value.trim();
    const competencia = formatarCompetencia(nfCompetencia.value);
    const valor = formatarValor(nfValor.value);
    
    if (!numero || !dataCompetencia || !competencia || !valor) {
        nfPreview.textContent = '-';
        return;
    }
    
    // Converter data de dd/mm/aaaa para dd.mm.aaaa
    const dataFormatada = dataCompetencia.replace(/\//g, '.');
    
    const nome = `${valor} - NF Nº ${numero} ${dataFormatada} - Ref ${competencia}`;
    nfPreview.textContent = nome + '.pdf';
}

// Atualizar preview do boleto
function updateBoletoPreview() {
    const competencia = formatarCompetencia(boletoCompetencia.value);
    const vencimento = boletoVencimento.value.trim();
    const valor = formatarValor(boletoValor.value);
    
    if (!competencia || !vencimento || !valor) {
        boletoPreview.textContent = '-';
        return;
    }
    
    // Converter data de dd/mm/aaaa para dd.mm.aaaa
    const dataFormatada = vencimento.replace(/\//g, '.');
    
    const nome = `${valor} - Boleto venc ${dataFormatada} - Ref ${competencia}`;
    boletoPreview.textContent = nome + '.pdf';
}

// Adicionar listeners para atualizar preview em tempo real
[nfNumero, nfDataEmissao, nfCompetencia, nfValor].forEach(input => {
    input.addEventListener('input', updateNFPreview);
});

[boletoCompetencia, boletoVencimento, boletoValor].forEach(input => {
    input.addEventListener('input', updateBoletoPreview);
});

// Mostrar mensagens
function showMessage(text, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = text;
    messages.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Limpar mensagens
function clearMessages() {
    messages.innerHTML = '';
}

// Validar campos
function validateNF() {
    if (!nfFile.files[0] && !nfXmlFile.files[0]) {
        // Não exige arquivo, apenas os campos
    }
    
    if (!nfNumero.value.trim() || !nfDataEmissao.value.trim() || !nfCompetencia.value.trim() || !nfValor.value.trim()) {
        showMessage('Por favor, preencha todos os campos da Nota Fiscal.', 'error');
        return false;
    }
    
    return true;
}

function validateBoleto() {
    if (!boletoFile.files[0]) {
        showMessage('Por favor, selecione um arquivo PDF do boleto.', 'error');
        return false;
    }
    
    if (!boletoCompetencia.value.trim() || !boletoVencimento.value.trim() || !boletoValor.value.trim()) {
        showMessage('Por favor, preencha todos os campos do Boleto.', 'error');
        return false;
    }
    
    return true;
}

// Converter e baixar
convertBtn.addEventListener('click', async () => {
    clearMessages();
    
    let hasNF = false;
    let hasNFXml = false;
    let hasBoleto = false;
    
    // Validar campos da NF se houver campos preenchidos ou arquivos
    const hasNFData = nfNumero.value.trim() || nfDataEmissao.value.trim() || nfCompetencia.value.trim() || nfValor.value.trim();
    if (hasNFData || nfFile.files[0] || nfXmlFile.files[0]) {
        if (!validateNF()) return;
        if (nfFile.files[0]) hasNF = true;
        if (nfXmlFile.files[0]) hasNFXml = true;
    }
    
    // Processar Boleto
    if (boletoFile.files[0]) {
        if (!validateBoleto()) return;
        hasBoleto = true;
    }
    
    if (!hasNF && !hasNFXml && !hasBoleto) {
        showMessage('Por favor, selecione pelo menos um arquivo (NF ou Boleto) ou preencha apenas os campos para gerar o preview.', 'error');
        return;
    }
    
    // Ordem de download: 1. NF PDF, 2. Boleto, 3. XML
    let delayAcumulado = 0;
    
    // 1. Baixar NF PDF (primeiro)
    if (hasNF) {
        const downloadNF = () => {
            const file = nfFile.files[0];
            const numero = nfNumero.value.trim();
            const dataCompetencia = nfDataEmissao.value.trim().replace(/\//g, '.');
            const competencia = formatarCompetencia(nfCompetencia.value);
            const valor = formatarValor(nfValor.value);
            
            const nomeArquivo = `${valor} - NF Nº ${numero} ${dataCompetencia} - Ref ${competencia}.pdf`;
            downloadFile(file, nomeArquivo);
            showMessage(`Nota Fiscal PDF baixada: ${nomeArquivo}`, 'success');
        };
        
        downloadNF();
        delayAcumulado = 600; // Delay para próximo download
    }
    
    // 2. Baixar Boleto (segundo)
    if (hasBoleto) {
        const downloadBoleto = () => {
            const file = boletoFile.files[0];
            const competencia = formatarCompetencia(boletoCompetencia.value);
            const vencimento = boletoVencimento.value.trim().replace(/\//g, '.');
            const valor = formatarValor(boletoValor.value);
            
            const nomeArquivo = `${valor} - Boleto venc ${vencimento} - Ref ${competencia}.pdf`;
            downloadFile(file, nomeArquivo);
            showMessage(`Boleto baixado: ${nomeArquivo}`, 'success');
        };
        
        setTimeout(downloadBoleto, delayAcumulado);
        delayAcumulado += 600; // Incrementar delay para próximo download
    }
    
    // 3. Baixar NF XML (terceiro e último)
    if (hasNFXml) {
        const downloadNFXml = () => {
            const file = nfXmlFile.files[0];
            const numero = nfNumero.value.trim();
            const dataCompetencia = nfDataEmissao.value.trim().replace(/\//g, '.');
            const competencia = formatarCompetencia(nfCompetencia.value);
            const valor = formatarValor(nfValor.value);
            
            const nomeArquivo = `${valor} - NF Nº ${numero} ${dataCompetencia} - Ref ${competencia}.xml`;
            downloadFile(file, nomeArquivo);
            showMessage(`Nota Fiscal XML baixada: ${nomeArquivo}`, 'success');
        };
        
        setTimeout(downloadNFXml, delayAcumulado);
    }
});

// Função para baixar arquivo
function downloadFile(file, newName) {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = newName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Inicializar
initCompetencia();
updateNFPreview();
updateBoletoPreview();

