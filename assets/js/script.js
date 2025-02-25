const timeZone = "America/Bogota";
const imgUser = document.querySelector("#imgUser");
const nameUser = document.querySelector("#nameUser");
const username = document.querySelector("#username");
const totalStorys = document.querySelector("#totalStorys");
const contentStories = document.querySelector(".contentStories");
const searchStories = document.querySelector("#searchStories");
const inputUsername = document.querySelector("#inputUsername");
const loading = document.querySelector(".loading");
const contentResult = document.querySelector(".contentResult");
const noDates = document.querySelector(".no-dates");
const accountPrivate = document.querySelector(".account-private");
let currentUser = null;
let isNoStories = false;
let isPrivate = false;

const date = new Date();

window.addEventListener("DOMContentLoaded", () => {
  inputUsername.value = "";
  document.querySelector("#yearPage").textContent = date.getFullYear();
});

inputUsername.addEventListener("keypress", (event) => {

  if (event.keyCode === 13) {

    if (inputUsername.value.toLowerCase() === currentUser){
      return;
    }

    currentUser = inputUsername.value.toLowerCase();

    if (inputUsername.value != "" && inputUsername.value.trim() != "") {
      loading.classList.remove("hide");
      loading.classList.add("show");

      contentResult.classList.remove("show");
      contentResult.classList.add("hide");

      if (isNoStories) {
        noDates.classList.remove("show");
        noDates.classList.add("hide");
        isNoStories = false;
      }

      if (isPrivate) {
        accountPrivate.classList.remove("show");
        accountPrivate.classList.add("hide");
        isNoStories = false;
      }

      getStory(inputUsername.value);
    }

    inputUsername.value = "";
  }
});

searchStories.addEventListener("click", () => {

  if (inputUsername.value.toLowerCase() === currentUser){
    return;
  }

  currentUser = inputUsername.value.toLowerCase();

  if (inputUsername.value != "" && inputUsername.value.trim() != "") {
    loading.classList.remove("hide");
    loading.classList.add("show");

    contentResult.classList.remove("show");
    contentResult.classList.add("hide");

    if (isNoStories) {
      noDates.classList.remove("show");
      noDates.classList.add("hide");
      isNoStories = false;
    }

    if (isPrivate) {
      accountPrivate.classList.remove("show");
      accountPrivate.classList.add("hide");
      isNoStories = false;
    }

    getStory(inputUsername.value);
  }

  inputUsername.value = "";
});

const getStory = async (inputUsername = "cristiano") => {
  const url = `https://instagram-scraper-api2.p.rapidapi.com/v1/stories?username_or_id_or_url=${inputUsername}&url_embed_safe=true`;

  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": "a051849697mshbc9ab4789512cbep19ec55jsn87de702b9930",
      "x-rapidapi-host": "instagram-scraper-api2.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.text();

    loading.classList.remove("show");
    loading.classList.add("hide");

    contentResult.classList.remove("hide");
    contentResult.classList.add("show");

    if (response.status === 200) {
      return renderStory(JSON.parse(result));
    }
  } catch (error) {
    console.error(error);
  }
};

const renderStory = (result) => {

  if (result.data.items.length === 0) {
    isNoStories = true;

    contentResult.classList.remove("show");
    contentResult.classList.add("hide");

    noDates.classList.remove("hide");
    noDates.classList.add("show");

    return;
  }

  const userName = result.data.additional_data.user.username;
  const isVerified = result.data.additional_data.user.is_verified;
  const isPrivateUser = result.data.additional_data.user.is_private;

  if (isPrivateUser) {
    contentResult.classList.remove("show");
    contentResult.classList.add("hide");

    accountPrivate.classList.remove("hide");
    accountPrivate.classList.add("show");

    return;
  }

  imgUser.setAttribute("src", result.data.additional_data.user.profile_pic_url);
  nameUser.textContent = result.data.additional_data.user.full_name;
  username.innerHTML = `@${userName} ${
    isVerified
      ? "<i class='bx bxs-badge-check' style='color:#0095f6; font-size: 1.5rem;'></i>"
      : ""
  }`;
  username.setAttribute("href", `https://www.instagram.com/${userName}`);

  // contentStories.innerHTML = "";
  let count = 0;

  let html = "";

  for (let storyItem of result.data.items) {
    if (storyItem.media_format == "image") {
      html += `
                <div class="card col-12 col-md-3">
                    <img src="${
                      storyItem.thumbnail_url
                    }" class="card-img-top" alt="">
                    <div class="card-body">
                        <p class="card-text">${storyItem.media_format}</p>
                        <p class="card-text">${convertEpochToTimeZone(storyItem.taken_at,timeZone)}</p>
                        <a href="${
                          storyItem.thumbnail_url
                        }" class="btn btn-primary w-100" download> Descargar </a>
                    </div>
                </div>
            `;
      count += 1;
    }

    if (storyItem.media_format == "video") {
      html += `
            <div class="card col-12 col-md-3">
                <div class="card-body">
                    <video src="${storyItem.video_url}" controls class="card-img-top"></video>
                    <p class="card-text">${storyItem.media_format}</p>
                    <p class="card-text">${convertEpochToTimeZone(storyItem.taken_at,timeZone)}</p>
                    <a href="${storyItem.video_url}" class="btn btn-primary w-100" download> Descargar </a>
                </div>
            </div>
            `;
      count += 1;
    }
  }

  totalStorys.textContent = count;

  contentStories.innerHTML = html;
};

function convertEpochToTimeZone(epochTime, timeZone) {
  const date = new Date(epochTime * 1000);
  if (isNaN(date.getTime())) {
    return "Fecha no válida";
  }

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timeZone,
  };

  const formatter = new Intl.DateTimeFormat("es-CO", options);
  return formatter.format(date);
}
