class App {

	init() {
		this.root = $('#root');
		this.url = "http://46.36.36.38:5000/api";
	}

	static loader(where) {
		where.append('<div class="loader" style="display: none;"></div>');
		where.find(".loader").fadeIn();
	}

	static noloader(where) {
		where.find(".loader").fadeOut().done(function () {
			$(this).remove();
		});
	}

	open(what, where, callback) {
		if (where === undefined) {
			where = this.root
		}
		App.loader(where);
		$.ajax({
			url: what,
			cache: false
		}).done(function(html) {
			where.empty().append(html);
			if (callback !== undefined) {
				callback(where);
			}
		}).fail(function (jqXHR, textStatus) {

		});
	}

	signin(form) {
		form = $(form);
		App.loader(form);
		$.ajax({
			url: this.url + "/user",
			method: 'POST',
			data: form.serializeArray(),
			xhrFields: {
				withCredentials: true
			}
		}).done(function(data) {
			App.noloader(form);
			alert(data.token)
		}).fail(function (jqXHR, textStatus) {
			App.noloader(form);
			alert(textStatus);
		});
	}

	content() {
		this.open("content.html", this.root, function (root) {
			let nav = new Navigation(root.find('#menu'));
			nav.setActiveItem(0);
		})
	}
}