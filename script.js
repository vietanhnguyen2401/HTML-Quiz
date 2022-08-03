const url = 'https://wpr-quiz-api.herokuapp.com/attempts'

// get buttons
const startBtn = document.querySelector("#start-quiz")
const submitBtn = document.querySelector("#submit-quiz")
const tryAgainBtn = document.querySelector("#try-again-btn")

// get screens
const attemptQuizScreen = document.querySelector("#attempt-quiz")
const reviewQuizScreen = document.querySelector("#review-quiz")

// get parts
const scorePart = document.querySelector(".score-part")
const submitQuizPart = document.querySelector(".submit-quiz-part")
const introductionPart = document.querySelector("#introduction")

let attemptId = ''
let answers = {}

// get quiz
const fetchApi = async () => {
    const result = await fetch(url, {method: 'POST'})
    return result.json()
}

// submit quiz
const submitQuiz = async () => {
    const result = await fetch(`${url}/${attemptId}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({answers})
    })
    return result.json()
}

// handle when user select answer
const selectAnswer = (e) => {
    const target = e.currentTarget;
    const parent = target.parentElement;
    const ancestor = parent.parentElement;
    const selectedAnswer = ancestor.querySelector(".selected-answer")
    const checkedInput = ancestor.querySelector(".selected-answer input")

    parent.classList.add("selected-answer")
    if (checkedInput) {
        selectedAnswer.classList.remove("selected-answer")
        checkedInput.checked = false
    }
}

// get answers from user
const getUserAnswers = () => {
    const inputs = attemptQuizScreen.querySelectorAll('.selected-answer input')
    inputs.forEach((input) => {
        const id = input.getAttribute('id').slice(1)
        answers[id] = parseInt(input.value)
    })
}

// prompt a confirmation to user
const getUserConfirmation = () => {
    return confirm('Are you sure to submit these answers?')
}

// build attempt quiz
const buildAttemptQuiz = async () => {
    const res = await fetchApi()
    if (!res) return
    attemptId = res._id

    res.questions.forEach((question, index) => {
        const quesContainer = document.createElement('div')
        quesContainer.classList.add('question')

        const title = document.createElement('h3')
        title.textContent = `Question ${index + 1} of 10`

        const questionText = document.createElement('p')
        questionText.textContent = question.text

        quesContainer.appendChild(title)
        quesContainer.appendChild(questionText)

        question.answers.forEach((answer, index) => {
            const answerContainer = document.createElement('div')
            answerContainer.classList.add('answer')

            const input = document.createElement('input')
            input.addEventListener('click', selectAnswer)
            input.setAttribute('type', 'radio')
            input.setAttribute('id', `${index}${question._id}`)
            input.setAttribute('value', `${index}`)
            input.setAttribute('name', question._id)

            const label = document.createElement('label')
            label.setAttribute('for', `${index}${question._id}`)
            label.textContent = answer

            answerContainer.appendChild(input)
            answerContainer.appendChild(label)
            quesContainer.appendChild(answerContainer)
        })

        attemptQuizScreen.appendChild(quesContainer)
    })

}

// build review quiz part after submit
const buildReviewQuiz = async () => {
    const res = await submitQuiz()
    if (!res) return
    const correctAnswers = res.correctAnswers

    res.questions.forEach((question, index) => {
        const quesContainer = document.createElement('div')
        quesContainer.classList.add('question')

        const title = document.createElement('h3')
        title.textContent = `Question ${index + 1} of 10`

        const questionText = document.createElement('p')
        questionText.textContent = question.text

        quesContainer.appendChild(title)
        quesContainer.appendChild(questionText)

        question.answers.forEach((answer, index) => {
            const answerContainer = document.createElement('div')
            answerContainer.classList.add('answer')

            const input = document.createElement('input')
            input.setAttribute('type', 'radio')
            input.disabled = true

            const label = document.createElement('label')
            label.textContent = answer

            const userAnswer = document.createElement('span')
            userAnswer.classList.add('answer-flag')
            userAnswer.textContent = 'Your answer'

            const correctAnswer = document.createElement('span')
            correctAnswer.classList.add('answer-flag')
            correctAnswer.textContent = 'Correct Answer'

            answerContainer.appendChild(input)
            answerContainer.appendChild(label)

            if (answers[question._id] === index) {
                input.checked = true
                answerContainer.classList.add('disable', 'selected-answer')
                answerContainer.appendChild(userAnswer)
            }

            if (answers[question._id] === correctAnswers[question._id] && answers[question._id] === index) {
                answerContainer.classList.add('disable', 'correct-answer')
            }

            if (answers[question._id] !== correctAnswers[question._id] && answers[question._id] === index) {
                answerContainer.classList.add('disable', 'wrong-answer')
            }

            if (correctAnswers[question._id] === index && answers[question._id] !== index) {
                answerContainer.classList.add('disable', 'selected-answer')
                answerContainer.appendChild(correctAnswer)
            }

            quesContainer.appendChild(answerContainer)
        })

        reviewQuizScreen.appendChild(quesContainer)
    })
    displayResult(res.score, res.scoreText)
}

// display result after submit
const displayResult = (score, scoreText) => {
    scorePart.querySelector('.number-of-correct-answers').textContent = `${score} / 10`
    scorePart.querySelector('.correct-percentage').textContent = `${score * 10}%`
    scorePart.querySelector('.score-text').textContent = scoreText
}

// start the quiz
startBtn.addEventListener("click", async () => {
    document.body.scrollIntoView()
    attemptQuizScreen.classList.remove("hidden")
    introductionPart.classList.add("hidden")
    await buildAttemptQuiz()
    submitQuizPart.classList.remove("hidden")
})

// submit answers
submitBtn.addEventListener("click", async () => {
    const userConfirmation = getUserConfirmation()
    if (!userConfirmation) return

    getUserAnswers()
    document.body.scrollIntoView()
    reviewQuizScreen.classList.remove("hidden")
    attemptQuizScreen.classList.add("hidden")
    submitQuizPart.classList.add("hidden")
    await buildReviewQuiz()
    scorePart.classList.remove("hidden")
})

// try again ---> hide and remove all children from attempt-quiz and review-quiz screen
// reset answers from user
tryAgainBtn.addEventListener("click", () => {
    answers = {}
    scorePart.classList.add('hidden')
    submitQuizPart.classList.add('hidden')
    reviewQuizScreen.innerHTML = ''
    reviewQuizScreen.classList.add('hidden')
    attemptQuizScreen.innerHTML = ''
    attemptQuizScreen.classList.add('hidden')
    introductionPart.classList.remove('hidden')
    document.body.scrollIntoView()
})
