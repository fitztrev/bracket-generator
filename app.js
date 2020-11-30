var pusher = new Pusher('a60d4dec4b5449a2541e', {
    cluster: 'us2'
})

new Vue({
    el: '#app',

    data: {
        username: '',
        gameType: 'rapid',
        challengeInstructions: '7+2 Casual',

        players: [],
        playerRatings: [],

        pairing_config: [
            [5, 1], // #5 seed plays #1 seed, etc...
            [8, 4],
            [6, 2],
            [7, 3],
        ],
    },

    mounted: function(){
        var channel = pusher.subscribe('registrations')
        channel.bind('signup', function(data) {
            this.addPlayer(data.username)
        }.bind(this))

        /*
         * Check URL for usernames
         * #user1,user2,user3
         */
        let users = window.location.hash.substr(1)
        if (users) {
            _.each(users.split(','), function(user){
                this.addPlayer(user)
            }.bind(this))
        }
    },

    computed: {
        playerRatingsSorted: function(){
            return _.orderBy(this.playerRatings, ['rating', 'games'], 'desc')
        },
        pairings: function(){
            /*
             * This generates the JSON to feed to
             * bracket.html to populate the bracket.
             */
            if (this.playerRatings.length !== 8) return

            let pairings = []

            for(var i=0; i<this.pairing_config.length; i++) {
                pairings.push(
                    [
                        '#' + this.pairing_config[i][0] + ' - ' + this.playerRatingsSorted[this.pairing_config[i][0] - 1].name,
                        '#' + this.pairing_config[i][1] + ' - ' + this.playerRatingsSorted[this.pairing_config[i][1] - 1].name,
                    ]
                )
            }

            return pairings
        },
        linkToBracket: function() {
            return 'bracket.html?challengeInstructions=' + encodeURIComponent(this.challengeInstructions) + '&pairings=' + encodeURIComponent(JSON.stringify(this.pairings))
        },
    },

    watch: {
        players: function(){
            this.fetchPlayerRatings()

            window.location.hash = this.players.join(',')
        },
        gameType: function(){
            this.fetchPlayerRatings()
        },
    },

    methods: {
        submit: function() {
            this.addPlayer(this.username)
            this.username = ''
        },

        addPlayer: function(username) {
            this.players.push(username)
        },

        removePlayer: function(username) {
            this.players = _.reject(this.players, function(player) {
                return player.toUpperCase() === username.toUpperCase()
            })
        },

        fetchPlayerRatings: function() {
            this.playerRatings = []
            axios.post('https://lichess.org/api/users', this.players.join(','))
                .then(function(response){
                    response.data.forEach(function(player){
                        this.playerRatings.push({
                            name: player.username,
                            rating: player.perfs[this.gameType].rating,
                            games: player.perfs[this.gameType].games,
                        })
                    }.bind(this))
                }.bind(this))
        },
    },
})
