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
            <img src="https://picsum.photos/id/${getSumChars(user.userData.username) % 300}/100/100">
        </div>
        <div class="profile-data">
            <h2>${user.userData.username}</h2>
            <p>Last Login: ${user.userStats.lastLogin}</p>
            <p>Current Streak: ${user.userStats.streak}</p>
        </div>
        <div class="profile-options">
            <button data-username="${user.userData.username}" onclick="ajaxAddFriend(this)">Add friend</button>
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
        }
    }
    );
}

function ajaxAddFriend(profile){
    let username = $(profile).attr("data-username")
    console.log(username)
}

$("#friend-search-submit").click(function(){
    ajaxFindFriends($("#friend-search-input").val())
})
$("#friend-search-input").on("keypress", function(e){
    if(e.which == 13) {
        ajaxFindFriends($("#friend-search-input").val())
    }
})