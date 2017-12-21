class App {

	constructor() {
		this.root = $('#root');
		this.alerts = $('#alerts');
		this.url = 'https://openmanga.pythonanywhere.com/api';
		//this.url = 'http://192.168.0.104:5000/api';
	}

	init() {
		if (Cookies.get('token') === undefined) {
			this.auth();
		} else {
			this.content();
		}
	}

	error(jqXHR, textStatus) {
		let l = app.root.find('.loader:visible');
		App.noloader(l.parent());
		let msg = textStatus;
		if (jqXHR.responseJSON !== undefined) {
			msg = jqXHR.responseJSON.message;
		}
		App.alert(app.alerts, null, msg);
	}

	static empty(target) {
		target.contents().filter(function () {
			return !$(this).is('.loader');
		}).remove();
		return target;
	}

	static loader(where, callback) {
		const l = where.find('> .loader');
		if (l.length) {
			l.fadeIn(callback);
			return;
		}
		where.append('<div class="loader" style="display: none;"></div>');
		where.find('> .loader').fadeIn(callback);
	}

	static noloader(where, callback) {
		where.find('> .loader').fadeOut(function () {
			$(this).remove();
			if (callback !== undefined) {
				callback();
			}
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
		App.loader(where, function () {
			$.ajax({
				url: what,
				cache: false
			}).done(function (html) {
				App.empty(where).append(html);
				App.noloader(where, callback);
			}).fail(app.error);
		});
	}

	signin(form) {
		form = $(form);
		App.loader(form);
		this.alerts.empty();
		const data = form.serializeArray();
		data.push({name: 'device', value: 'Web client'});
		console.log(data);
		$.ajax({
			url: this.url + '/user',
			method: 'POST',
			data: data,
			xhrFields: {
				withCredentials: true
			}
		}).done(function (data) {
			console.log(data);
			if (data.state === 'success') {
				form.fadeOut(function () {
					Cookies.set('token', data.token);
					app.content();
				});
			} else {
				App.noloader(form);
				App.alert(app.alerts, null, data.message);
			}
		}).fail(app.error);
	}

	content() {
		this.open('content.html', this.root, function (root) {
			let nav = new Navigation(app.root.find('#menu'));
			//nav.setActiveItem(0);
			app.history();
		});
	}

	auth() {
		this.open('auth.html', this.root);
	}

	logout() {
		$('.navbar').slideUp();
		App.loader(this.root, function () {
			$.ajax({
				url: app.url + '/user',
				method: 'DELETE',
				data: {self: 1},
				headers: {
					'X-AuthToken': Cookies.get('token')
				},
				xhrFields: {
					withCredentials: true
				}
			}).done(function (data) {
				Cookies.remove('token');
				app.auth();
			}).fail(app.error);
		});
	}

	devices() {
		const target = $('#target');
		App.loader(target, function () {
			App.empty(target);
			$.ajax({
				url: app.url + '/user',
				method: 'GET',
				headers: {
					'X-AuthToken': Cookies.get('token')
				},
				xhrFields: {
					withCredentials: true
				}
			}).done(function (data) {
				console.log(data);
				if (data.state === 'success') {
					if (data.devices.length === 0) {
						target.append('<div class="row h-100"><div class="col align-self-center text-center text-muted">You have no any attached devices</div></div>');
						App.noloader(target);
						return;
					}
					let str = '';
					data.devices.forEach(function (item, i) {
						str += `
							<div class="col-12 card mt-2" id="token_${item.id}">
								<div class="card-block">
									${item.device}
									<a href="#" class="text-accent pull-right fa fa-times" aria-hidden="true" onclick="app.detach(${item.id}); return false;"></a>
								</div>
							</div>`;
					});
					target.append(str);
					App.noloader(target);
				} else {
					App.alert(app.alerts, null, data.message);
				}
			}).fail(app.error);
		});
	}

	history() {
		const target = $('#target');
		App.loader(target, function () {
			App.empty(target);
			$.ajax({
				url: app.url + '/history',
				method: 'GET',
				headers: {
					'X-AuthToken': Cookies.get('token')
				},
				xhrFields: {
					withCredentials: true
				}
			}).done(function (data) {
				console.log(data);
				if (data.all.length === 0) {
					target.append('<div class="row h-100"><div class="col align-self-center text-center text-muted">You history is empty</div></div>');
					App.noloader(target);
					return;
				}
				if (data.state === 'success') {
					let str = '<div class="card-columns mt-2">';
					data.all.forEach(function (item, i) {
						str += `<div class="card" id="manga_${item.manga.id}">
								<img class="card-img-top img-fluid mx-auto d-block" src="${item.manga.preview}">
								<div class="card-block">
									<h4 class="card-title">${item.manga.name}</h4>
									<p class="card-text">${item.manga.summary}</p>
									<p class="card-text"><small class="text-muted">Last updated: ${new Date(item.timestamp).toISOString().slice(0, 10)}</small></p>
								</div>
								<div class="card-footer text-right">
									<a class="text-muted fa fa-trash" href="#" onclick="app.remove('history', ${item.manga.id}); return false;" title="Remove this manga"></a>
									<a class="text-muted fa fa-external-link-square" target="_blank" href="${item.manga.path}" title="Open in website"></a>
								</div>
							</div>`;
					});
					str += '</div>';
					target.append(str);
					App.noloader(target);
				} else {
					App.alert(app.alerts, null, data.message);
				}
			}).fail(app.error);
		});
	}

	favourites() {
		const target = $('#target');
		App.loader(target, function () {
			App.empty(target);
			$.ajax({
				url: app.url + '/favourites',
				method: 'GET',
				headers: {
					'X-AuthToken': Cookies.get('token')
				},
				xhrFields: {
					withCredentials: true
				}
			}).done(function (data) {
				console.log(data);
				if (data.state === 'success') {
					if (data.all.length === 0) {
						target.append('<div class="row h-100"><div class="col align-self-center text-center text-muted">You have no any favourite manga</div></div>');
						App.noloader(target);
						return;
					}
					let str = '<div class="card-columns mt-2">';
					data.all.forEach(function (item, i) {
						str += `<div class="card" id="manga_${item.manga.id}">
								<img class="card-img-top img-fluid mx-auto d-block" src="${item.manga.preview}">
								<div class="card-block">
									<h4 class="card-title">${item.manga.name}</h4>
									<p class="card-text">${item.manga.summary}</p>
									<p class="card-text"><small class="text-muted">Last updated: ${new Date(item.timestamp).toISOString().slice(0, 10)}</small></p>
								</div>
								<div class="card-footer text-right">
									<a class="fa fa-trash text-muted" href="#"  onclick="app.remove('favourites', ${item.manga.id}); return false;" title="Remove this manga"></a>
									<a class="fa fa-external-link-square text-muted" target="_blank" href="${item.manga.path}" title="Open in website"></a>
								</div>
							</div>`;
					});
					str += '</div>';
					target.append(str);
					App.noloader(target);
				} else {
					App.alert(app.alerts, null, data.message);
				}
			}).fail(app.error);
		});
	}

	detach(device_id) {
		const row = $('#token_' + device_id);
		App.loader(row, function () {
			$.ajax({
				url: app.url + '/user',
				method: 'DELETE',
				data: {id: device_id},
				headers: {
					'X-AuthToken': Cookies.get('token')
				},
				xhrFields: {
					withCredentials: true
				}
			}).done(function (data) {
				row.slideUp();
			}).fail(app.error);
		});
	}

	remove(subject, manga_id) {
		const card = $('#manga_' + manga_id);
		App.loader(card, function () {
			$.ajax({
				url: app.url + '/' + subject,
				method: 'DELETE',
				data: {id: manga_id},
				headers: {
					'X-AuthToken': Cookies.get('token')
				},
				xhrFields: {
					withCredentials: true
				}
			}).done(function (data) {
				card.fadeOut();
			}).fail(app.error);
		});
	}
}
