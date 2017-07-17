class App {

	constructor() {
		this.root = $('#root');
		this.alerts = $('#alerts');
		this.url = 'http://192.168.0.104:5000/api';
	}

	init() {
		if (Cookies.get('token') === undefined) {
			this.auth();
		} else {
			this.content();
		}
	}

	static loader(where) {
		where.append('<div class="loader" style="display: none;"></div>');
		where.find('.loader').fadeIn();
	}

	static noloader(where) {
		where.find('.loader').fadeOut(function () {
			$(this).remove();
		});
	}

	static alert(where, title, content, type, dismissible) {
		if (type === undefined) {
			type = 'danger';
		}
		if (dismissible === undefined) {
			dismissible = true;
		}
		const id = 'alert_' + Math.ceil(Math.random() * 100);
		let str = `<div id="${id}" class="alert alert-${type}`;
		if (dismissible) {
			str += ' alert-dismissible fade show';
		}
		str += `" role="alert">`;
		if (dismissible) {
			str += '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
		}
		if (title !== null && title !== undefined) {
			str += `<strong>${title}</strong>`;
		}
		str += content + '</div>';
		where.append(str);
		const al = where.find('#' + id);
		al.alert();
		return al;
	}

	open(what, where, callback) {
		if (where === undefined) {
			where = this.root;
		}
		App.loader(where);
		$.ajax({
			url: what,
			cache: false
		}).done(function (html) {
			where.empty().append(html);
			if (callback !== undefined) {
				callback(where);
			}
		}).fail(function (jqXHR, textStatus) {
			App.alert(app.alerts, null, textStatus);
		});
	}

	signin(form) {
		form = $(form);
		App.loader(form);
		this.alerts.empty();
		$.ajax({
			url: this.url + '/user',
			method: 'POST',
			data: form.serializeArray(),
			xhrFields: {
				withCredentials: true
			}
		}).done(function (data) {
			App.noloader(form);
			console.log(data);
			if (data.state === 'success') {
				Cookies.set('token', data.token);
				app.content()
			} else {
				App.alert(app.alerts, null, data.message);
			}
		}).fail(function (jqXHR, textStatus) {
			App.noloader(form);
			App.alert(app.alerts, null, textStatus);
		});
	}

	content() {
		this.open('content.html', this.root, function (root) {
			let nav = new Navigation(root.find('#menu'));
			//nav.setActiveItem(0);
			app.devices()
		});
	}

	auth() {
		this.open('auth.html', this.root, function (root) {

		});
	}

	logout() {
		Cookies.remove('token');
		this.auth();
	}

	devices() {
		const target = $('#target');
		target.empty();
		App.loader(target);
		$.ajax({
			url: app.url + '/user',
			method: 'GET',
			headers: {
				"X-AuthToken":Cookies.get('token'),
			},
			xhrFields: {
				withCredentials: true
			}
		}).done(function (data) {
			console.log(data);
			if (data.state === 'success') {
				let str = '';
				data.devices.forEach(function(item, i) {
					str += `
							<div class="col-12 card mt-2">
								<div class="card-block">
									${item.device}
								</div>
							</div>`;
				});

				target.append(str);
				App.noloader(target);
			} else {
				App.alert(app.alerts, null, data.message);
			}
		}).fail(function (jqXHR, textStatus) {
			App.noloader(target);
			App.alert(app.alerts, null, textStatus);
		});
	}

	history() {
		const target = $('#target');
		target.empty();
		App.loader(target);
		$.ajax({
			url: app.url + '/history',
			method: 'GET',
			headers: {
				"X-AuthToken":Cookies.get('token'),
			},
			xhrFields: {
				withCredentials: true
			}
		}).done(function (data) {
			console.log(data);
			if (data.state === 'success') {
				let str = '<div class="card-columns mt-2">';
				data.all.forEach(function(item, i) {
					str += `<div class="card">
								<img class="card-img-top img-fluid mx-auto d-block" src="${item.manga.preview}">
								<div class="card-block">
									<h4 class="card-title">${item.manga.name}</h4>
									<p class="card-text">${item.manga.summary}</p>
									<p class="card-text"><small class="text-muted">Last updated: ${new Date(item.timestamp).toISOString().slice(0, 10)}</small></p>
								</div>
								<div class="card-footer text-right">
									<a class="fa fa-external-link" target="_blank" href="${item.manga.path}"></a>
								</div>
							</div>`;
				});
				str += '</div>';
				target.append(str);
				App.noloader(target);
			} else {
				App.alert(app.alerts, null, data.message);
			}
		}).fail(function (jqXHR, textStatus) {
			App.noloader(target);
			App.alert(app.alerts, null, textStatus);
		});
	}

	favourites() {
		const target = $('#target');
		target.empty();
		App.loader(target);
		$.ajax({
			url: app.url + '/favourites',
			method: 'GET',
			headers: {
				"X-AuthToken":Cookies.get('token'),
			},
			xhrFields: {
				withCredentials: true
			}
		}).done(function (data) {
			console.log(data);
			if (data.state === 'success') {
				let str = '<div class="card-columns mt-2">';
				data.all.forEach(function(item, i) {
					str += `<div class="card">
								<img class="card-img-top img-fluid mx-auto d-block" src="${item.manga.preview}">
								<div class="card-block">
									<h4 class="card-title">${item.manga.name}</h4>
									<p class="card-text">${item.manga.summary}</p>
									<p class="card-text"><small class="text-muted">Last updated: ${new Date(item.timestamp).toISOString().slice(0, 10)}</small></p>
								</div>
								<div class="card-footer text-right">
									<a class="fa fa-external-link" target="_blank" href="${item.manga.path}"></a>
								</div>
							</div>`;
				});
				str += '</div>';
				target.append(str);
				App.noloader(target);
			} else {
				App.alert(app.alerts, null, data.message);
			}
		}).fail(function (jqXHR, textStatus) {
			App.noloader(target);
			App.alert(app.alerts, null, textStatus);
		});
	}
}