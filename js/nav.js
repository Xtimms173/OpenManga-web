class Navigation {

	constructor(menu) {
		let it = this;
		this.items = menu.find('.nav-link');
		this.items.off('click').on('click', function (e) {
			e.preventDefault();
			it.onclick($(e.target));
		});
	}

	setActiveItem(index) {
		this.onclick($(this.items[index]));
	}

	onclick(it) {
		this.items.not(it).removeClass('active');
		it.addClass('active');
		let open = it.data('open');
		let target = it.data('target');
		let action = it.data('action');
	}
}