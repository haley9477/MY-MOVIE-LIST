'use strict'

const BASE_URL = 'https://webdev.alphacamp.io' // 放進變數以便之後版本更新直接修改最有效率 
const INDEX_URL = BASE_URL + '/api/movies/' // 組合就是完整的 index API URL 
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PEAGE = 12 // 每頁顯示12筆電影

const movies = [] // 用來存放陣列中所有電影的容器, 並且是不會隨便更動的資料
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

// 呈現所有電影列表
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img src="${POSTER_URL + item.image}"
               class="card-img-top"
               alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie"
                    data-bs-toggle="modal"
                    data-bs-target="#movie-modal"
                    data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

// 呈現總頁數
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PEAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link"
             href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

// 點擊 btn:More 跳出互動視窗 傳入電影id的函式
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalDate.innerText = 'Release date: ' + data.release_date
      modalDescription.innerText = data.description
      modalImage.innerHTML = `
        <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
      `
    })
}

// 點擊 btn:+ 加入favorite 傳入電影id的函式
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  // 錯誤處理: 重複加入
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單中!')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// 根據傳入的頁數取出特定範圍的電影資料
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PEAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PEAGE)
}

// 監聽 btn:More, btn:+ 的父層 dataPanel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 監聽 btn:submit 的父層 searchForm
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  // 取消預設事件
  event.preventDefault()
  // 取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase() // trim()前後空白去掉, toLowerCase()轉換小寫

  // 條件篩選方法一
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  // 條件篩選方法二
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  // 錯誤處理: 處理無效字串
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字: ${keyword} 沒有符合條件的電影`)
  }

  // if (!keyword.length) {
  //   return alert('請輸入有效字串!')
  // }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

// 監聽 a: page 的父層 paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

// 方法一
axios.get(INDEX_URL)
  .then(response => {
    movies.push(...response.data.results) // ... 三個點為展開運算子
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch(error => console.log(error))

// 方法二
// axios.get(INDEX_URL)
//   .then(response => {
//     for (const movie of response.data.results) {movies.push(movie)}
//     console.log(movies)
//   })
//   .catch(error => console.log(error))

// axios.get(INDEX_URL)
//   .then(response => {
//     movies.push(response.data.results) // 只會有 1 個元素的陣列
//     console.log(movies)
//     console.log(movies.length) // 1
//   })
//   .catch(error => console.log(error)) 