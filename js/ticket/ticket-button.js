export function createTicketButton(onClick) {
  const button = document.createElement('button');
  button.className = 'ticket-button';
  button.type = 'button';
  button.textContent = '切符発行';
  button.addEventListener('click', onClick);
  document.body.appendChild(button);

  // 切符を出している間は押せないようにする
  function setEnabled(on) {
    button.disabled = !on;
  }

  function setLabel(text) {
    button.textContent = text;
  }

  return { setEnabled, setLabel };
}