class App {

	constructor() {
		this.root = $('#root');
		this.alerts = $('#alerts');
		//this.url = 'http://46.36.36.38:5000/api';
		this.url = 'http://192.168.0.104:5000/api';
	}

	init() {
		if (Cookies.get('token') === undefined) {
			this.auth();
		} else {
			this.content();
		}
	}

	static empty(target) {
		target.contents().filter(function () {
			return !$(this).is('.loader');
		}).remove();
		return target;
	}

	static loader(where, callback) {
		if (where.find('.loader').length) {
			if (callback !== undefined) {
				callback();
			}
			return;
		}
		where.append('<div class="loader" style="display: none;"></div>');
		where.find('.loader').fadeIn(callback);
	}

	static noloader(where, callback) {
		where.find('.loader').fadeOut(function () {
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
			}).fail(function (jqXHR, textStatus) {
				App.noloader(where);
				App.alert(app.alerts, null, textStatus);
			});
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
			App.noloader(form);
			console.log(data);
			if (data.state === 'success') {
				form.fadeOut(function () {
					Cookies.set('token', data.token);
					app.content();
				});
			} else {
				App.alert(app.alerts, null, data.message);
			}
		}).fail(function (jqXHR, textStatus) {
			App.noloader(form);
			let msg = textStatus;
			if (jqXHR.responseJSON !== undefined) {
				msg = jqXHR.responseJSON.message;
			}
			App.alert(app.alerts, null, msg);
		});
	}

	content() {
		this.open('content.html', this.root, function (root) {
			let nav = new Navigation(root.find('#menu'));
			//nav.setActiveItem(0);
			app.devices();
		});
	}

	auth() {
		this.open('auth.html', this.root);
	}

	logout() {
		App.loader(this.root, function () {
			Cookies.remove('token');
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
				app.auth();
			});
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
					let str = '';
					data.devices.forEach(function (item, i) {
						str += `
							<div class="col-12 card mt-2" id="token_${item.id}">
								<div class="card-block">
									${item.device}
									<a href="#" class="text-danger pull-right fa fa-times" aria-hidden="true" onclick="app.detach(${item.id}); return false;"></a>
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
									<a class="fa fa-trash-o" href="#" onclick="app.remove('history', ${item.manga.id}); return false;" title="Remove this manga"></a>
									<a class="fa fa-external-link" target="_blank" href="${item.manga.path}" title="Open in website"></a>
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
									<a class="fa fa-trash-o" href="#"  onclick="app.remove('favourites', ${item.manga.id}); return false;" title="Remove this manga"></a>
									<a class="fa fa-external-link" target="_blank" href="${item.manga.path}" title="Open in website"></a>
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
			});
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
			});
		});
	}
}