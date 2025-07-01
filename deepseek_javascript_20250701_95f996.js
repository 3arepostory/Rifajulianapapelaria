// Observador de interseção para animações
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Gerar os números da rifa (todos disponíveis inicialmente)
const numbersGrid = document.getElementById('numbersGrid');
let soldNumbers = []; // Começa sem números vendidos

for (let i = 1; i <= 500; i++) {
    const numberElement = document.createElement('button');
    numberElement.className = 'number';
    numberElement.textContent = i;
    numberElement.dataset.number = i;
    
    numberElement.addEventListener('click', () => openNumberModal(i));
    numbersGrid.appendChild(numberElement);
}

// Modal de número selecionado
const modal = document.getElementById('numberModal');
const selectedNumberSpan = document.getElementById('selectedNumber');
const numberStatus = document.getElementById('numberStatus');
const whatsappBtn = document.getElementById('whatsappBtn');
const closeModal = document.getElementById('closeModal');
const pdfFormContainer = document.getElementById('pdfFormContainer');
const tokenInput = document.getElementById('tokenInput');
const buyerInfoForm = document.getElementById('buyerInfoForm');
const generatePdfBtn = document.getElementById('generatePdfBtn');
const ticketPreview = document.getElementById('ticketPreview');
const ticketNumberDisplay = document.getElementById('ticketNumberDisplay');
const ticketNameDisplay = document.getElementById('ticketNameDisplay');
const ticketWhatsappDisplay = document.getElementById('ticketWhatsappDisplay');
const ticketEmailDisplay = document.getElementById('ticketEmailDisplay');
const ticketBigNumber = document.getElementById('ticketBigNumber');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

let currentSelectedNumber = 0;
const FIXED_TOKEN = "JULIANARIFA25"; // Token fixo para desbloqueio

function openNumberModal(number) {
    currentSelectedNumber = number;
    const isSold = soldNumbers.includes(number);
    
    selectedNumberSpan.textContent = number;
    
    if (isSold) {
        numberStatus.textContent = 'Este número já foi vendido.';
        whatsappBtn.style.display = 'none';
        pdfFormContainer.style.display = 'none';
    } else {
        numberStatus.textContent = 'Este número está disponível para compra.';
        whatsappBtn.style.display = 'block';
        pdfFormContainer.style.display = 'block';
        buyerInfoForm.style.display = 'none';
        ticketPreview.classList.remove('visible');
        tokenInput.value = ''; // Resetar o token ao abrir novo modal
    }
    
    modal.style.display = 'flex';
    
    // Adicionar animação ao número selecionado
    const numberElement = document.querySelector(`.number[data-number="${number}"]`);
    numberElement.classList.add('selected');
    
    // Remover animação quando o modal fechar
    closeModal.addEventListener('click', () => {
        numberElement.classList.remove('selected');
    });
}

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

whatsappBtn.addEventListener('click', () => {
    const number = selectedNumberSpan.textContent;
    const message = `Olá, vim pelo site da rifa e gostaria do número ${number}. Por favor, me informe como proceder com o pagamento.`;
    const whatsappUrl = `https://wa.me/5511974762699?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    modal.style.display = 'none';
});

// Validação do token e exibição do formulário
tokenInput.addEventListener('input', (e) => {
    if (e.target.value.toUpperCase() === FIXED_TOKEN) {
        buyerInfoForm.style.display = 'block';
    } else {
        buyerInfoForm.style.display = 'none';
    }
});

// Gerar preview do ticket
generatePdfBtn.addEventListener('click', () => {
    const fullName = document.getElementById('fullName').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const email = document.getElementById('email').value;
    
    if (!fullName || !whatsapp || !email) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Atualizar informações no preview
    ticketNumberDisplay.textContent = currentSelectedNumber;
    ticketNameDisplay.textContent = fullName;
    ticketWhatsappDisplay.textContent = whatsapp;
    ticketEmailDisplay.textContent = email;
    ticketBigNumber.textContent = currentSelectedNumber;
    
    // Mostrar preview
    ticketPreview.classList.add('visible');
});

// GERAR PDF - VERSÃO CONFIÁVEL E FUNCIONAL
async function generatePdf() {
    try {
        // Atualiza os dados no ticket PDF
        document.getElementById('pdfTicketNumber').textContent = currentSelectedNumber;
        document.getElementById('pdfName').textContent = document.getElementById('fullName').value;
        document.getElementById('pdfWhatsapp').textContent = document.getElementById('whatsapp').value;
        document.getElementById('pdfEmail').textContent = document.getElementById('email').value;
        
        const randomCode = `JUL-${currentSelectedNumber}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        document.getElementById('pdfCode').textContent = randomCode;
        
        // Captura o ticket como imagem usando html2canvas
        const ticketElement = document.getElementById('pdfTicket');
        const canvas = await html2canvas(ticketElement, {
            scale: 2, // Melhora a qualidade
            logging: false,
            useCORS: true, // Permite carregar imagens externas
            allowTaint: true
        });
        
        // Cria o PDF
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [80, 120] // Mesmo tamanho do ticket
        });
        
        // Adiciona a imagem ao PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 80, 120);
        
        // Salva o PDF
        pdf.save(`Bilhete-Rifa-${currentSelectedNumber}.pdf`);
        
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
        
        // Fallback simples caso html2canvas falhe
        try {
            const pdf = new jspdf.jsPDF();
            pdf.text(`Bilhete Rifa Nº ${currentSelectedNumber}`, 10, 10);
            pdf.text(`Nome: ${document.getElementById('fullName').value}`, 10, 20);
            pdf.text(`WhatsApp: ${document.getElementById('whatsapp').value}`, 10, 30);
            pdf.text(`E-mail: ${document.getElementById('email').value}`, 10, 40);
            pdf.save(`Bilhete-Rifa-Simples-${currentSelectedNumber}.pdf`);
        } catch (simpleError) {
            console.error("Erro no fallback simples:", simpleError);
        }
    }
}

// Configura o botão de download
downloadPdfBtn.addEventListener('click', generatePdf);

// Alternar tema claro/escuro
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggle.textContent = '☀️';
    } else {
        localStorage.setItem('theme', 'light');
        themeToggle.textContent = '🌓';
    }
});

// Verificar preferência de tema salva
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

// Efeito de digitação no título
const title = document.querySelector('h1');
const originalText = title.textContent;
title.textContent = '';

let i = 0;
const typingEffect = setInterval(() => {
    if (i < originalText.length) {
        title.textContent += originalText.charAt(i);
        i++;
    } else {
        clearInterval(typingEffect);
    }
}, 100);

// Efeito de flores caindo (Sakura azul)
function createSakura() {
    const sakura = document.createElement('div');
    sakura.classList.add('sakura');
    
    const size = Math.random() * 15 + 10;
    const left = Math.random() * window.innerWidth;
    const blueHue = Math.floor(Math.random() * 30) + 200;
    const opacity = Math.random() * 0.7 + 0.3;

    sakura.style.width = `${size}px`;
    sakura.style.height = `${size}px`;
    sakura.style.left = `${left}px`;
    sakura.style.animationDuration = `${Math.random() * 5 + 5}s`;
    sakura.style.animationDelay = `${Math.random() * 5}s`;
    
    sakura.innerHTML = `
        <svg viewBox="0 0 100 100" width="${size}" height="${size}">
            <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" 
                  fill="hsla(${blueHue}, 80%, 70%, ${opacity})"/>
        </svg>
    `;
    
    document.body.appendChild(sakura);
    
    setTimeout(() => {
        sakura.remove();
    }, 15000);
}

setInterval(createSakura, 500);

// Painel Admin
const adminBtn = document.getElementById('adminBtn');
const adminOptions = document.getElementById('adminOptions');
const markSoldBtn = document.getElementById('markSoldBtn');
const resetNumbersBtn = document.getElementById('resetNumbersBtn');
const ADMIN_PASSWORD = "54564034"; // Senha administrativa
let isAdminAuthenticated = false;

// Alternar visibilidade do painel admin
adminBtn.addEventListener('click', () => {
    if (!isAdminAuthenticated) {
        const password = prompt("🔒 Acesso Restrito\n\nDigite a senha administrativa:");
        if (password === ADMIN_PASSWORD) {
            isAdminAuthenticated = true;
            adminOptions.classList.add('show');
        } else if (password !== null) {
            alert("Senha incorreta! Apenas administradores podem acessar.");
        }
    } else {
        adminOptions.classList.toggle('show');
    }
});

// Marcar número como vendido
markSoldBtn.addEventListener('click', () => {
    if (!isAdminAuthenticated) return;
    
    const number = prompt("Digite o número que deseja marcar como vendido:");
    if (number && !isNaN(number) && number >= 1 && number <= 500) {
        const num = parseInt(number);
        if (!soldNumbers.includes(num)) {
            soldNumbers.push(num);
            const numberElement = document.querySelector(`.number[data-number="${num}"]`);
            numberElement.classList.add('sold');
            numberElement.title = 'Número já vendido';
            alert(`Número ${num} marcado como vendido!`);
        } else {
            alert("Este número já está marcado como vendido!");
        }
    } else {
        alert("Por favor, digite um número válido entre 1 e 500!");
    }
    adminOptions.classList.remove('show');
});

// Resetar todos os números
resetNumbersBtn.addEventListener('click', () => {
    if (!isAdminAuthenticated) return;
    
    if (confirm("Tem certeza que deseja resetar TODOS os números para disponíveis?")) {
        soldNumbers = [];
        document.querySelectorAll('.number').forEach(num => {
            num.classList.remove('sold');
            num.title = '';
        });
        alert("Todos os números foram resetados para disponíveis!");
    }
    adminOptions.classList.remove('show');
});

// Fechar painel admin ao clicar fora
document.addEventListener('click', (e) => {
    if (!adminBtn.contains(e.target) && !adminOptions.contains(e.target)) {
        adminOptions.classList.remove('show');
    }
});