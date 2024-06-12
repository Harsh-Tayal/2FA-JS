const $loginForm = $("#loginForm");
const $2FABox = $("#2FABox");
const $userId = $("#userId");

const checkSession = async () => {
  try {
    const response = await fetch("/check");
    const { success, id } = await response.json();
    $loginForm.removeClass("codeRequested");
    $2FABox.removeClass("ready");
    if (success) {
      $("body").addClass("logged");
      $userId.text(id);
    } else {
      $("body").removeClass("logged");
      $userId.text("");
    }
  } catch (error) {
    console.error(error);
    // Handle error, maybe show a message to the user
  }
};

jQuery(document).ready(($) => {
  checkSession();

  $("#logoutButton").click(async (e) => {
    try {
      await fetch("/logout");
      await checkSession();
    } catch (error) {
      console.error(error);
      // Handle error, maybe show a message to the user
    }
  });

  $loginForm.submit(async (e) => {
    e.preventDefault();
    const id = e.target.id.value;
    const password = e.target.password.value;
    const code = e.target.code.value;
    let url = `/login?id=${id}&password=${password}`;
    if (code) url += `&code=${code}`;
    try {
      const response = await fetch(url);
      const { success, error, codeRequested } = await response.json();

      if (codeRequested) {
        $loginForm.addClass("codeRequested");
        return;
      }

      if (success) {
        $loginForm.trigger("reset");
        await checkSession();
      } else {
        alert(error);
      }
    } catch (error) {
      console.error(error);
      // Handle error, maybe show a message to the user
    }
  });

  $("#enable2FAButton").click(async () => {
    try {
      const response = await fetch("/qrImage");
      const { image, success } = await response.json();
      if (success) {
        $("#qrImage").attr("src", image);
        $2FABox.addClass("ready");
      } else {
        alert("Unable to fetch the QR image");
      }
    } catch (error) {
      console.error(error);
      // Handle error, maybe show a message to the user
    }
  });

  $("#twoFAUpdateForm").submit(async (e) => {
    e.preventDefault();
    const code = e.target.code.value;
    try {
      const response = await fetch("/set2FA?code=" + code);
      const { success } = await response.json();
      if (success) {
        alert("SUCCESS: 2FA enabled/updated");
      } else {
        alert("ERROR: Unable to update/enable 2FA");
      }
      $("#twoFAUpdateForm").trigger("reset");
    } catch (error) {
      console.error(error);
      // Handle error, maybe show a message to the user
    }
  });
});
