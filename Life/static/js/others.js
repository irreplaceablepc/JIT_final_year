// Get the file input and the form
const avatarInput = document.getElementById('avatarInput');
const uploadForm = document.getElementById('uploadForm');
const uploadButton = document.getElementById('uploadButton');

// Add an event listener to the file input
// avatarInput.addEventListener('change', function() {
//     // Submit the form when a file is selected
//     uploadForm.submit();
// });

//  home to post button and back
function togglePage(pageId) {
    var page = document.getElementById(pageId);
    if (page.style.display === 'none') {
        page.style.display = 'block';
    } else {
        page.style.display = 'none';
    }
}
// password change form
$('#h-search-bar').on('input', async (event) => {
    const query = event.target.value.trim();

    try {
        const users = await $.get(`/users/search?query=${query}`);

        // Display search results
        $('#search-results').empty();
        users.forEach(user => {
            $('#search-results').append(`<div style="display: flex; background-color: #cccc"><img src="${user.avatar}" onerror="this.onerror=null; this.src='/img/avatar.png'"/><a href="/users/profile/${user._id}"><h3>${user.name}</h3></a></div>`);
        });
        

        // Show search results div
        $('#search-results').addClass('show');
    } catch (error) {
        console.error(error);
    }
});
{/* <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script> */}


function showFollowersList() {
    var followersListDiv = document.getElementById("followersList");
    followersListDiv.style.display = "block";
  }

  function hideFollowersList() {
    var followersListDiv = document.getElementById("followersList");
    followersListDiv.style.display = "none";
  }


  function showFollowingList() {
    var followingListDiv = document.getElementById("followingList");
    followingListDiv.style.display = "block";
  }

  function hideFollowingList() {
    var followingListDiv = document.getElementById("followingList");
    followingListDiv.style.display = "none";
  }