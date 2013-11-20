/**
 * modalEffects.js v1.0.0
 * http://www.codrops.com
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * Bastardised by Rob Reng - I didn't want this to run at initialisation, and we're using JQuery anyway so classie can do one
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
var ModalEffects = (function() {

	var $overlay = $('.md-overlay');

	function openModalTrigger(el){

		var $modal = $( '#' + el.getAttribute( 'data-modal' ) );

		openModal($modal);

	}

	function openModal($modal){

		$modal.addClass('md-show');
		$overlay.addClass('md-show');
		$overlay.unbind('click');
		$overlay.on('click', closeModalHanlder);

		function closeModalHanlder() {
			closeModal($modal);
		}
	}

	function closeModal($modal) {
		$modal.removeClass('md-show');
		$overlay.removeClass('md-show');
	}

	return {openModal: openModal, openModalTrigger: openModalTrigger, closeModal: closeModal};

})();