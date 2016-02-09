(function ($) {

	var
		url = 'kladr-api.ru/api.php',
		/**
		 * Преобразует запрос из формата принятого в плагине в формат сервиса
		 *
		 * @param {{}} query Запрос в формате плагина
		 * @returns {{}} Запрос в формате сервиса
		 */
		toApiFormat = function (query) {
			var params = {},
				fields = {
					type: 'contentType',
					name: 'query',
					withParents: 'withParent'
				};

			if (query.parentType && query.parentId) {
				params[query.parentType + 'Id'] = query.parentId;
			}

			for (var key in query) {
				if (query.hasOwnProperty(key) && query[key]) {
					params[fields.hasOwnProperty(key) ? fields[key] : key] = query[key];
				}
			}

			return params;
		};


	$.kladr = {};

	(function () {
		var protocol = location.protocol == 'https:' ? 'https:' : 'http:';

		/**
		 * URL сервиса
		 *
		 * @type {string}
		 */
		$.kladr.url = protocol + '//' + url;
	})();

	/**
	 * Перечисление типов объектов
	 *
	 * @type {{region: string, district: string, city: string, street: string, building: string}}
	 */
	$.kladr.type = {
		region: 'region',   // Область
		district: 'district', // Район
		city: 'city',     // Город
		street: 'street',   // Улица
		building: 'building'  // Строение
	};

	/**
	 * Перечисление типов населённых пунктов
	 *
	 * @type {{city: number, settlement: number, village: number}}
	 */
	$.kladr.typeCode = {
		city: 1, // Город
		settlement: 2, // Посёлок
		village: 4  // Деревня
	};

	/**
	 * Проверяет корректность запроса
	 *
	 * @param {{}} query Запрос
	 * @returns {boolean}
	 */
	$.kladr.validate = function (query) {
		var type = this.type;

		switch (query.type) {
			case type.region:
			case type.district:
			case type.city:
				if (query.parentType && !query.parentId) {
					error('parentId undefined');
				}
				break;
			case type.street:
				if (query.parentType != type.city) {
					error('parentType must equal "city"');
				}
				if (!query.parentId) {
					error('parentId undefined');
				}
				break;
			case type.building:
				if (!query.zip) {
					if (!~$.inArray(query.parentType, [type.street, type.city])) {
						error('parentType must equal "street" or "city"');
					}
					if (!query.parentId) {
						error('parentId undefined');
					}
				}
				break;
			default:
				if (!query.oneString) {
					error('type incorrect');
				}
				break;
		}

		if (query.oneString && query.parentType && !query.parentId) {
			error('parentId undefined');
		}

		if (query.typeCode && (query.type != type.city)) {
			error('type must equal "city"');
		}

		if (query.limit < 1) {
			error('limit must greater than 0');
		}

		return true;
	};

	/**
	 * Отправляет запрос к сервису
	 *
	 * @param {{}} query Запрос
	 * @param {Function} callback Функция, которой будет передан массив полученных объектов
	 */
	$.kladr.api = function (query, callback) {
		if (!callback) {
			error('Callback undefined');
		}

		var timeout = setTimeout(function () {
			callback([]);
			timeout = null;
		}, 3000);

		$.get(this.url + "?callback=?",
			toApiFormat(query),
			function (data) {
				if (timeout) {
					callback(data.result || []);
					clearTimeout(timeout);
				}
			}, 'jsonp');
	};

	/**
	 * Проверяет существование объекта, соответствующего запросу
	 *
	 * @param {{}} query Запрос
	 * @param {Function} callback Функция, которой будет передан объект, если он существует, или
	 * false если не существует.
	 */
	$.kladr.check = function (query, callback) {
		if (!callback)
			error('Callback undefined');

		query.withParents = false;
		query.limit = 1;

		this.api(query, function (objs) {
			objs && objs.length
				? callback(objs[0])
				: callback(false);
		});
	};

	/**
	 * Выводит ошибку на консоль
	 *
	 * @param {string} error Текст ошибки
	 */
	function error(error) {
		throw new Error(error);
	}
})(jQuery);