import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './api/keyAPI';
import {
  galeryEl,
  textCollections,
  formEl,
  btnLoadMore,
  submitEl,
  textEl,
} from './elements/elements';

function markupGalleryCard(array) {
  const markup = array
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class='photo-card'>
  <a href='${largeImageURL}'>
    <img src='${webformatURL}' alt='${tags}' loading='lazy' />
  </a>
  <div class='info'>
    <p class='info-item'>
      <b>Likes</b>
      ${likes}
    </p>
    <p class='info-item'>
      <b>Views</b>
      ${views}
    </p>
    <p class='info-item'>
      <b>Comments</b>
      ${comments}
    </p>
    <p class='info-item'>
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div>`;
      }
    )
    .join('');

  galeryEl.insertAdjacentHTML('beforeend', markup);
}

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

let currentPage = 1;
let currentHits = 0;
let searchQuery = '';

formEl.addEventListener('submit', searchForm);

async function searchForm(event) {
  event.preventDefault();
  searchQuery = event.currentTarget.searchQuery.value;
  currentPage = 1;

  if (searchQuery === '') {
    return;
  }

  const response = await fetchImages(searchQuery, currentPage);
  currentHits = response.hits.length;

  if (response.totalHits > 40) {
    btnLoadMore.classList.remove('is-hidden');
  } else {
    btnLoadMore.classList.add('is-hidden');
  }

  try {
    if (response.totalHits > 0) {
      Notify.success(`Hooray! We found ${response.totalHits} images.`);
      galeryEl.innerHTML = '';
      markupGalleryCard(response.hits);
      lightbox.refresh();
      textCollections.classList.add('is-hidden');

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * -100,
        behavior: 'smooth',
      });
    }
    if (response.totalHits === 0) {
      galeryEl.innerHTML = '';
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      btnLoadMore.classList.add('is-hidden');
      textCollections.classList.add('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

btnLoadMore.addEventListener('click', clickBtnLoad);

async function clickBtnLoad() {
  currentPage += 1;
  const response = await fetchImages(searchQuery, currentPage);
  markupGalleryCard(response.hits);
  lightbox.refresh();
  currentHits += response.hits.length;

  if (currentHits === response.totalHits) {
    btnLoadMore.classList.add('is-hidden');
    textCollections.classList.remove('is-hidden');
  }
}
