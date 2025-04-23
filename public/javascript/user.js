
const userlog=document.querySelector(".userlog");
const userbt=document.querySelector(".userbt");
const userop = document.querySelector(".UserOptions");
userbt.addEventListener("click",()=>{
    userop.classList.toggle("hidden");
})
const YourTransactions=document.querySelector(".YourTransactions");
YourTransactions.addEventListener("click",()=>{
    if(!userop.classList.contains("hidden")){
        userop.classList.add("hidden");
    }
})
