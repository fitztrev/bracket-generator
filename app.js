new Vue({
    el: '#app',

    data: {
        usernames: ``,
        gameType: 'rapid',
        challengeInstructions: '7+2 Casual',

        playerRatings: [],

        pairing_config: [
            [5, 1], // #5 seed plays #1 seed, etc...
            [8, 4],
            [6, 2],
            [7, 3],
        ],
    },

    computed: {
        players: function(){
            return this.usernames.split("\n").filter(Boolean)
        },
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

    methods: {
        submit: function() {
            this.playerRatings = []
            this.fetchPlayerRatings()
        },

        fetchPlayerRatings: function() {
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
