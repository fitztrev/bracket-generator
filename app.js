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
