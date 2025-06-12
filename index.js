const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const agendaContainer = document.querySelector(".agenda");
const mesesInputs = document.querySelectorAll(
  '.menu-meses input[type="radio"]'
);
const modal = document.getElementById("modal-reserva");
const modalData = document.getElementById("modal-data");
const inputHoraInicio = document.getElementById("input-hora-inicio");
const inputHoraFim = document.getElementById("input-hora-fim");
const modalMsg = document.getElementById("modal-msg");
const btnConfirmar = document.getElementById("btn-confirmar");
const btnCancelar = document.getElementById("btn-cancelar");
const reservasDiaDiv = document.getElementById("reservas-dia");

let reservas = {};
let diaSelecionado = null;
let mesSelecionado = 0;

// Criar calendário do mês e ano informados
function criarCalendario(mes, ano) {
  agendaContainer.innerHTML = "";

  const agendaMes = document.createElement("div");
  agendaMes.classList.add("agenda-mes", "ativo");

  const tituloMes = document.createElement("h2");
  tituloMes.textContent = `${meses[mes]} ${ano}`;
  tituloMes.style.textAlign = "center";
  tituloMes.style.color = "#00bfff";
  agendaMes.appendChild(tituloMes);

  const cabecalhoSemana = document.createElement("div");
  cabecalhoSemana.classList.add("dias-semana");
  diasSemana.forEach((d) => {
    const div = document.createElement("div");
    div.textContent = d;
    cabecalhoSemana.appendChild(div);
  });
  agendaMes.appendChild(cabecalhoSemana);

  const diasMes = document.createElement("div");
  diasMes.classList.add("dias-mes");

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  let deslocamento = primeiroDia === 0 ? 6 : primeiroDia - 1;

  for (let i = 0; i < deslocamento; i++) {
    const vazio = document.createElement("div");
    vazio.classList.add("dia", "vazio");
    diasMes.appendChild(vazio);
  }

  for (let d = 1; d <= totalDias; d++) {
    const dia = document.createElement("div");
    dia.classList.add("dia");
    dia.textContent = d;

    const chaveData = `${ano}-${(mes + 1).toString().padStart(2, "0")}-${d
      .toString()
      .padStart(2, "0")}`;
    if (reservas[chaveData]) {
      dia.classList.add("reservado");
    }

    dia.addEventListener("click", () => abrirModalReserva(chaveData, d));

    diasMes.appendChild(dia);
  }

  agendaMes.appendChild(diasMes);
  agendaContainer.appendChild(agendaMes);
}

// Abre modal para reservar horário
function abrirModalReserva(dataStr, diaNum) {
  diaSelecionado = dataStr;
  modalData.textContent = `${diaNum} de ${meses[mesSelecionado]} de 2025`;
  inputHoraInicio.value = "";
  inputHoraFim.value = "";
  modalMsg.textContent = "";
  reservasDiaDiv.innerHTML = "";

  if (reservas[diaSelecionado]) {
    reservas[diaSelecionado].forEach((res, i) => {
      const p = document.createElement("p");
      p.textContent = `Reserva: ${formatarHora(res.inicio)} - ${formatarHora(
        res.fim
      )}`;
      p.title = "Clique para remover";
      p.style.cursor = "pointer";
      p.addEventListener("click", () => {
        reservas[diaSelecionado].splice(i, 1);
        if (reservas[diaSelecionado].length === 0) {
          delete reservas[diaSelecionado];
        }
        atualizarCalendario();
        abrirModalReserva(diaSelecionado, diaNum);
      });
      reservasDiaDiv.appendChild(p);
    });
  }

  modal.style.display = "flex";
}

// Fecha modal
function fecharModal() {
  modal.style.display = "none";
  inputHoraInicio.value = "";
  inputHoraFim.value = "";
  modalMsg.textContent = "";
  reservasDiaDiv.innerHTML = "";
}

// Formata hora em "HH:MM"
function formatarHora(horaDecimal) {
  const h = Math.floor(horaDecimal);
  const m = (horaDecimal - h) * 60;
  return `${h.toString().padStart(2, "0")}:${m === 0 ? "00" : m}`;
}

// Converte string "HH:MM" em decimal (ex: 08:30 -> 8.5)
function horaParaDecimal(horaStr) {
  const [h, m] = horaStr.split(":").map(Number);
  return h + m / 60;
}

// Verifica conflitos entre o intervalo [inicio, fim)
function verificaConflito(inicio, fim) {
  const reservasDoDia = reservas[diaSelecionado] || [];

  // Validar intervalo permitido
  if (inicio < 8 || inicio > 19) {
    modalMsg.textContent = "Horário de início deve ser entre 08:00 e 19:00.";
    modalMsg.className = "modal-msg error";
    return true;
  }
  if (fim <= inicio) {
    modalMsg.textContent = "Horário de término deve ser maior que o início.";
    modalMsg.className = "modal-msg error";
    return true;
  }
  if (fim > inicio + 3) {
    modalMsg.textContent =
      "O término pode ser no máximo 3 horas depois do início.";
    modalMsg.className = "modal-msg error";
    return true;
  }
  if (fim > 22) {
    modalMsg.textContent = "Horário de término máximo é 22:00.";
    modalMsg.className = "modal-msg error";
    return true;
  }

  // Verifica se o intervalo conflita com alguma reserva
  for (const res of reservasDoDia) {
    // Se houver intersecção entre os intervalos [inicio,fim) e [res.inicio,res.fim)
    if (!(fim <= res.inicio || inicio >= res.fim)) {
      modalMsg.textContent = "Conflito! Horário já reservado nesse período.";
      modalMsg.className = "modal-msg error";
      return true;
    }
  }

  return false;
}

// Adiciona reserva com intervalo personalizado
function adicionarReserva() {
  if (!inputHoraInicio.value || !inputHoraFim.value) {
    modalMsg.textContent = "Por favor, selecione horário início e término.";
    modalMsg.className = "modal-msg error";
    return;
  }

  const inicio = horaParaDecimal(inputHoraInicio.value);
  const fim = horaParaDecimal(inputHoraFim.value);

  if (verificaConflito(inicio, fim)) {
    return;
  }

  if (!reservas[diaSelecionado]) {
    reservas[diaSelecionado] = [];
  }

  reservas[diaSelecionado].push({ inicio, fim });

  modalMsg.textContent = "Reserva adicionada com sucesso!";
  modalMsg.className = "modal-msg success";

  atualizarCalendario();

  abrirModalReserva(diaSelecionado, parseInt(diaSelecionado.split("-")[2]));
}

// Atualiza calendário ao mudar mês
function atualizarCalendario() {
  criarCalendario(mesSelecionado, 2025);
}

// Eventos troca de mês
mesesInputs.forEach((input, index) => {
  input.addEventListener("change", () => {
    if (input.checked) {
      mesSelecionado = index;
      atualizarCalendario();
    }
  });
});

// Botões do modal
btnConfirmar.addEventListener("click", adicionarReserva);
btnCancelar.addEventListener("click", fecharModal);

// Fecha modal clicando fora do conteúdo
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    fecharModal();
  }
});

// Inicializa calendário no mês atual
atualizarCalendario();
