const API_URL = "https://economia.awesomeapi.com.br/json/last/USD-BRL";
const REFRESH_INTERVAL = 10_000;

const elements = {
  currentPrice: document.querySelector("#current-price"),
  dayHigh: document.querySelector("#day-high"),
  dayLow: document.querySelector("#day-low"),
  updatedTime: document.querySelector("#updated-time"),
  errorMessage: document.querySelector("#error-message"),
  refreshButton: document.querySelector("#refresh-button"),
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

let requestInProgress = false;

function formatQuoteTime(timestamp) {
  const numericTimestamp = Number(timestamp);
  if (!Number.isFinite(numericTimestamp)) return "agora";

  const milliseconds = numericTimestamp > 1e12 ? numericTimestamp : numericTimestamp * 1000;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(milliseconds));
}

function renderQuote(quote) {
  const bid = Number(quote.bid);
  const high = Number(quote.high);
  const low = Number(quote.low);

  if (![bid, high, low].every(Number.isFinite)) {
    throw new Error("A resposta da API veio em um formato inesperado.");
  }

  elements.currentPrice.textContent = currencyFormatter.format(bid);
  elements.dayHigh.textContent = currencyFormatter.format(high);
  elements.dayLow.textContent = currencyFormatter.format(low);
  elements.updatedTime.textContent = `às ${formatQuoteTime(quote.timestamp)}`;
  elements.errorMessage.hidden = true;
}

async function loadQuote() {
  if (requestInProgress) return;

  requestInProgress = true;
  elements.refreshButton.disabled = true;

  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`A API respondeu com status ${response.status}.`);

    const data = await response.json();
    if (!data.USDBRL) throw new Error("Não foi possível encontrar a cotação USD/BRL na resposta.");

    renderQuote(data.USDBRL);
  } catch (error) {
    elements.errorMessage.textContent = `${error.message} Verifique sua conexão e tente novamente.`;
    elements.errorMessage.hidden = false;
  } finally {
    requestInProgress = false;
    elements.refreshButton.disabled = false;
  }
}

elements.refreshButton.addEventListener("click", loadQuote);

loadQuote();
window.setInterval(loadQuote, REFRESH_INTERVAL);