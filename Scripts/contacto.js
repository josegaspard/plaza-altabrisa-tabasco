/* Contacto: envío de cForm y rForm.
   Con servidor PHP los formularios van tal cual a enviarCorreo.php.
   En la demo estática (sin PHP) se confirma en pantalla sin salir de la página. */
(function () {
  'use strict';
  var esDemo = /\.github\.io$/.test(location.hostname) || location.protocol === 'file:';

  function preparar(id, texto) {
    var form = document.getElementById(id);
    if (!form) return;
    var msg = form.querySelector('.form-msg');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      if (!esDemo) { if (btn) btn.disabled = true; return; }
      e.preventDefault();
      if (msg) msg.textContent = texto;
      form.reset();
    });
  }

  preparar('cForm', 'Gracias, recibimos tu comentario.');
  preparar('rForm', 'Gracias, recibimos tu solicitud.');
})();
