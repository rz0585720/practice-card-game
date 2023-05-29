const GAME_STATE = {
	FirstCardAwaits: 'FirstCardAwaits',
	SecondCardAwaits: 'SecondCardAwaits',
	CardsMatched: 'CardsMatched',
	CardsMatchFailed: 'CardsMatchFailed',
	GameFinished: 'GameFinished',
}
const Symbols = [
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png',
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png',
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png',
	'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png',
]

const view = {
	getCardElement(index) {
		return `<div class="card back" data-index="${index}"></div>`
	},

	getCardContent(index) {
		const number = this.transformNumber(Math.floor(index % 13) + 1)
		const symbol = Symbols[Math.floor(index / 13)]
		return `
    <p>${number}</p>
    <img src="${symbol}" alt="">
    <p>${number}</p>`
	},

	transformNumber(number) {
		switch (number) {
			case 1:
				return 'A'
			case 11:
				return 'J'
			case 12:
				return 'Q'
			case 13:
				return 'K'
			default:
				return number
		}
	},
	// 渲染卡片
	displayCards(indexes) {
		const rootElement = document.querySelector('#cards')
		rootElement.innerHTML = indexes
			.map(index => this.getCardElement(index))
			.join('')
	},
	// 翻牌
	flipCards(...cards) {
		cards.map(card => {
			if (card.classList.contains('back')) {
				// 回傳正面
				card.classList.remove('back')
				card.innerHTML = this.getCardContent(Number(card.dataset.index))
				return
			}
			card.classList.add('back')
			card.innerHTML = null
		})
	},
	// 配對成功更改樣式
	pairCards(...cards) {
		cards.map(card => {
			card.classList.add('pair')
			return
		})
	},

	renderScore(score) {
		document.querySelector('.score').textContent = `Score: ${score}`
	},

	renderTriedTimes(times) {
		document.querySelector('.tried').textContent = `You've tried: ${times} times`
	},

	appendWrongAnimation(...cards) {
		cards.map(card => {
			card.classList.add('wrong')
			card.addEventListener('animationend', event => {
			event.target.classList.remove('wrong')
		}, { once: true })
		})		
	},

	showGameComplete() {
		const div = document.createElement('div')
		div.classList.add('completed')
		div.innerHTML = `
			<p>Well done!</p>
			<p>Score: ${model.score}</p>
			<p>You've tried: ${model.triedTimes} times</p>
		`
		const header = document.querySelector('#header')
		header.before(div)
	}
}

// 洗牌
const utility = {
	getRandomNumberArray(count) {
		const number = Array.from(Array(count).keys())
		for (let index = number.length - 1; index > 0; index--) {
			const randomIndex = Math.floor(Math.random() * (index + 1))
			;[number[index], number[randomIndex]] = [
				number[randomIndex],
				number[index],
			]
		}
		return number
	},
}

const controller = {
	currentState: GAME_STATE.FirstCardAwaits,

	generateCards() {
		view.displayCards(utility.getRandomNumberArray(52))
	},

	dispatchCardAction(card) {
		if (!card.classList.contains('back')) {
			return
		}

		switch (this.currentState) {
			case GAME_STATE.FirstCardAwaits:
				view.flipCards(card)
				model.revealedCards.push(card)
				this.currentState = GAME_STATE.SecondCardAwaits
				return

			case GAME_STATE.SecondCardAwaits:
				view.renderTriedTimes(++model.triedTimes)
				view.flipCards(card)
				model.revealedCards.push(card)

				if (model.isRevealedCardsMatched()) {
					// 配對正確
					view.renderScore((model.score += 10))
					this.currentState = GAME_STATE.CardsMatched
					view.pairCards(...model.revealedCards)
					model.revealedCards = []
					if (model.score === 260) {
						console.log('showGameComplete')
						this.currentStates = GAME_STATE.GameFinished
						view.showGameComplete()
						return
					}
					this.currentState = GAME_STATE.FirstCardAwaits
				} else {
					// 配對失敗
					this.currentState = GAME_STATE.CardsMatchFailed
					view.appendWrongAnimation(...model.revealedCards)
					setTimeout(this.resetCards, 1000)
				}
				return
		}
	},

	resetCards() {
		view.flipCards(...model.revealedCards)
		model.revealedCards = []
		controller.currentState = GAME_STATE.FirstCardAwaits
	},
}

const model = {
	revealedCards: [],

	isRevealedCardsMatched() {
		return (
			this.revealedCards[0].dataset.index % 13 ===
			this.revealedCards[1].dataset.index % 13
		)
	},

	score: 0,
	triedTimes: 0,
}

controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
	card.addEventListener('click', event => {
		controller.dispatchCardAction(card)
	})
})