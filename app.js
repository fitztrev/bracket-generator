new Vue({
    el: '#app',

    data: {
        usernames: ``,
        gameType: 'rapid',
        challengeInstructions: '7+2 Casual',
        format: 'bracket',

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
            let direction = this.format === 'ladder' ? 'asc' : 'desc'
            return _.orderBy(this.playerRatings, ['rating', 'games'], direction)
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
        ladderIsDefeated: function() {
            return this.playerRatings.length && this.playerRatings.length === _.filter(this.playerRatings, p => p.ladderResult === 'win').length
        },
    },

    watch: {
        ladderIsDefeated: function(value){
            if (value) this.fireConfetti()
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
                            ladderResult: '',
                        })
                    }.bind(this))
                }.bind(this))
        },

        fireConfetti: function() {
            // https://www.kirilv.com/canvas-confetti/
            var duration = 20 * 1000;
            var animationEnd = Date.now() + duration;
            var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            var interval = setInterval(function() {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
                confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
            }, 250);
        },
    },
})
