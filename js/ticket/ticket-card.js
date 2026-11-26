export function showTicketCard(canvas) {
  const card = document.createElement('div');
  card.className = 'ticket-card';
  card.appendChild(canvas); // Step 1の絵をそのまま表示
  document.body.appendChild(card);

  requestAnimationFrame(() => card.classList.add('is-visible')); // ふわっと出す

  return { element: card };
}