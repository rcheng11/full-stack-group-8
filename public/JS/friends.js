// helper function for generating img ids
function getSumChars(username){
    var output = 0
    for(let i = 0; i < username.length; i++){
        output += username.charCodeAt(i)
    }
    return output
}
// creates HTML for profiles
function profileHTML(user){
    return (
        `<div class="profile-container">
        <div class="profile-img">
            <img src="https://picsum.photos/seed/${user.userData.username}/100/100">
        </div>
        <div class="profile-data">
            <h2>${user.userData.username}</h2>
            <p>School: ${user.userData.school}</p>
            <p>Last Active: ${new Date(user.userStats.lastLogin).toDateString()}</p>
            <p>Current Streak: <i style="color: orange" class='bx bxs-hot bx-tada'></i> ${user.userStats.streak}</p>
        </div>
        <div class="profile-options">
            <button class="add-friend" data-username="${user.userData.username}" onclick="ajaxAddFriend(this)">Add friend</button>
            <button disabled>View Profile</button>
        </div>
        </div>`
    )
}

let request = null
function ajaxFindFriends(username){
    if (request != null)
    request.abort();

    request = $.ajax(
    {
        type: 'GET',
        url: "/findFriends?name="+encodeURIComponent(username),
        success: function(res) {
            $(".friend-search-target").empty()
            res.users.forEach(user => {
                $(".friend-search-target").append(profileHTML(user))
            })
            if (res.users.length == 0){
                $(".friend-search-target").append(`<div class="profile-container" style="justify-content: center; padding: 2rem">No Results</div>`)
            }
        }
    }
    );
}

function ajaxAddFriend(profile){
    let username = $(profile).attr("data-username")
    let data = {
        username : username
    }
    if (request != null)
    request.abort();

    request = $.ajax(
    {
        type: 'POST',
        data: data,
        url: "/addFriend",
        success: function(res) {
            flashPopUp(res)
        }
    }
    );
}

$("#friend-search-submit").click(function(){
    ajaxFindFriends($("#friend-search-input").val())
})
$("#friend-search-input").on("keypress", function(e){
    if(e.which == 13) {
        ajaxFindFriends($("#friend-search-input").val())
    }
})