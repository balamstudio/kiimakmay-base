/* global pp_mx_product */
;(function( $, window, document ) {
	'use strict';
	if(wc_ppexpress_product_context.environment=="live")
	{
		wc_ppexpress_product_context.environment = "production";
	}
	var is_modal = parseInt( wc_ppexpress_product_context.show_modal );
	var PAYPAL_REDIRECT_URL = 'https://www.paypal.com/checkoutnow?token=';
	function check_click() {
		$( '.btn_ppexpress_mx_widget' ).each(function(){
			if ( ! $( this ).hasClass( 'addedEventPP' ) ) {
				$( this ).addClass( 'addedEventPP' );
				var id = 'pp_widget_' + parseInt( Math.random() * 1000 );
				$( this ).attr( 'id', id );
				paypal.Button.render({
					env: wc_ppexpress_product_context.environment,
					locale: wc_ppexpress_product_context.locale,
					style: wc_ppexpress_product_context.style_widget,
					payment: function() {
						// Make a call to your server to set up the payment
						var result = paypal.request.post( wc_ppexpress_product_context.ppexpress_update_cart_url )
							.then(function(res) {
								if ( is_modal ) {
									return res.paymentID;
								}
								document.location.href = PAYPAL_REDIRECT_URL + res.paymentID;
								return false;
							});
						return result;
					},
					onAuthorize: function(data, actions) {
						return actions.redirect();
					},
					onCancel: function(data, actions) {
						return actions.redirect();
					}
				}, id );
			}
		});
		$( '#btn_ppexpress_mx_product' ).each(function(){
			if ( ! $( this ).hasClass( 'addedEventPP' ) ) {
				$( this ).addClass( 'addedEventPP' );
				paypal.Button.render({
					env: wc_ppexpress_product_context.environment,
					locale: wc_ppexpress_product_context.locale,
					style: wc_ppexpress_product_context.style,
					payment: function() {
						var atts = get_attributes();
						if ( atts.count != atts.chosenCount ) {
							alert( wc_ppexpress_product_context.att_empty );
							return false;
						}
						var data = {
							'qty':        $( '.quantity .qty' ).val()
						};
						if ($( '.variations_form' ).length ) {
							for ( var idx in atts.data ) {
								data['attributes[' + idx + ']'] = atts.data[idx];
							}
						}
						// Make a call to your server to set up the payment
						return paypal.request.post( wc_ppexpress_product_context.ppexpress_generate_cart_url, data )
							.then(function(res) {
								if ( is_modal ) {
									return res.paymentID;
								}
								document.location.href = PAYPAL_REDIRECT_URL + res.paymentID;
								return false;
							});
					},
					onAuthorize: function(data, actions) {
						return actions.redirect();
					},
					onCancel: function(data, actions) {
						return actions.redirect();
					}
				}, $( this ).attr( 'id' ) );
			}// End if().
		});
	}
	var get_attributes = function() {
		var select = $( '.variations_form' ).find( '.variations select' ),
			data   = {},
			count  = 0,
			chosen = 0;

		select.each( function() {
			var attribute_name = $( this ).data( 'attribute_name' ) || $( this ).attr( 'name' );
			var value	  = $( this ).val() || '';

			if ( value.length > 0 ) {
				chosen++;
			}

			count++;
			data[ attribute_name ] = value;
		} );

		return {
			'count'      : count,
			'chosenCount': chosen,
			'data'       : data
		};
	};
	setInterval( check_click, 2000 );
	$( document.body ).bind( 'wc_fragment_refresh', check_click );
	$( document.body ).bind( 'wc_fragments_loaded', check_click );
})( jQuery, window, document );
