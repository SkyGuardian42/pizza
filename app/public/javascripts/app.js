  // Initialize Firebase
var config = {
	apiKey: "AIzaSyB2pCIqWt8_44LZKRVjNSFJNj1v8AaRnbs",
	authDomain: "pizza-besteller.firebaseapp.com",
	databaseURL: "https://pizza-besteller.firebaseio.com",
	projectId: "pizza-besteller",
	storageBucket: "",
	messagingSenderId: "274890008242"
	};
firebase.initializeApp(config);
const db = firebase.database();
const dbRef = db.ref('validated');

let app = new Vue({
  el: '#app',
  data: {
		user: {
			name: "",
			pizza: "",
			email: "",
			_1109: true
		},
		anmeldungen: [],
		formSend: false,
		error: ""
	},
	methods: {
		validateInput: function () {
			if (this.user.name == "") {
				this.error = "Name fehlt"
				return true;
			} else if (this.user.email == "") {
				this.error = "Email fehlt"
				return true;
			} else if (this.user.pizza == "") {
				this.error = "Pizzawunsch fehlt"
				return true;
			}
			return false;
		},
		signup: function () {
			if(this.validateInput()) return;

			let opts = this.user;

			const formBody = Object.keys(opts) .map(key=>encodeURIComponent(key)+'='+encodeURIComponent(opts[key])) .join('&');
			
			fetch('api/add', {
				method: "POST",
				headers: {
					'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
					'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
				},
				body: formBody
			}).then(function(res) {
				return res.json();
			}).then(function(data) {
				if (data.error)
					app.error = data.error;
				if (data.status == "success") {
					sessionStorage.setItem('formSend', true);
					app.formSend = true;
				}
			});
		}
	}
})

dbRef.on('value', function(snapshot) {
	app.anmeldungen = snapshot.val();
});
