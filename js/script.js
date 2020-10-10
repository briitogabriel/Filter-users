//Receberá os dados de retorno do fecthUsers
let users = [];
let userList = document.querySelector('#users');
let statisticList = document.querySelector('#statistics');
let inputSearch = document.querySelector('#input-search');
let buttonSearch = document.querySelector('#btn-search');
//Definição de quantidade mínima de caracteres para abilitar os comandos JS
const minimunType = 1;
inputSearch.focus();
buttonSearch.disabled = true;

  //formatador de números para o padrão BR -> Intl = internacional Number format BR
  const formatter = Intl.NumberFormat('pt-BR');

window.addEventListener('load', start);

// definição de variáveis que mapearão o HTML
function start(){
  showNoStatistics();
  showNoUsers();
  addEvents();
  fetchUsers();
};

//fetch da API (poderia utilizar a url padrão ao invés de criar uma local na pasta backend)
//Procedimento: salvar um arquivo .json com os dados da API remota;
//iniciar o node pelo prompt backend com: npm init -y
//instalação de dependência para node no backend com: npm install --save-dev json-server
//após instalação, abrir arquivo package.json e inserir o "start": "json-server --watch DOCUMENTO.json --port 3001"
//o watch irá monitorar o arquivo .json criado e inseri-lo na porta "3001" por exemplo (o react já utiliza a 3000)
//no prompt, iniciar o live-server com: npm start (integra a API com fetch)

async function fetchUsers() {
    const res = await fetch("https://randomuser.me/api/?seed=javascript&results=100&nat=BR&noinfo");
    const json = await res.json();
        
    //Utilizará o .map pois a API tem muitos dados "inúteis" para a nossa aplicação, assim criamos um novo array reduzido
    users = json.results.map(({login, name, dob, picture, gender}) => {
      return {
        id: login.uuid,
        name: `${name.first} ${name.last}`,
        //o filterName servirá para que a pesquisa retorne valores digitados minúsculos, mas será exibido o name (acima)
        filterName: `${name.first} ${name.last}`.toLowerCase(),
        age: dob.age,
        picture: picture.large,
        gender
      };
    });

    //localeCompare é função nativa do JS que ordena os nomes
  users.sort((a, b) => a.name.localeCompare(b.name));
}

//funções a serem executadas pós inserção de dados ou cliques (depois de liberado o botão)
function addEvents(){
  inputSearch.addEventListener('keyup', handleChange);
  buttonSearch.addEventListener('click', () => filterUsers(inputSearch.value.trim()));
}

//monitorar o que é digitado no input
function handleChange(event) {
  //trim serve para retirar os espaços em branco antes e depois do value
  const searchText = event.target.value.trim();
  //medir quantidade de caracteres digitados
  const length = searchText.length;

  //tendo a quantidade acima, compara com o mínimo (declarado no início do JS) para abilitar o botão
  buttonSearch.disabled = length < minimunType;

  //se for digitado ENTER ou a qntd de caracteres for menor que 1, não faz nada (return)
  if (event.key !== 'Enter'){
    return;
  }
  if (length < minimunType){
    return;
  }
  
  //se não atender as condições acima, realiza busca/filtro
  filterUsers(searchText);
}

function filterUsers(searchText){
  //converter texto digitado para lower, para comparar com a lista convertida também para lower (ambos com a função toLowerCase())
  const lowerCaseText = searchText.toLowerCase();

  //users = array que recebeu o FETCH da API
  //FILTER para selecionar dentre os nomes e criar novo array conforme busca
  //user = texto receberá os dados filtrados
  //filterName é a propriedade convertida lowerCase dentro do array FETCH que vai comparar o texto lowerCase digitado ("includes" é para ver se contém o que foi digitado em qualquer lugar do nome. Ex: "Andrea" pode ser encontrada com "ndr")
  const filteredUsers = users.filter((user) => {
    return user.filterName.includes(lowerCaseText);
  });

  //exibir dados na tela
  handleFilteredUsers(filteredUsers);
}

//renderizar/exibir dados filtrados (caso não tenha filtro vai executar as funções "showNo")
function handleFilteredUsers(users){
  if (users.length === 0){
    showNoUsers();
    showNoStatistics();
  }

  showUsers(users);
  showStatistics(users);
}

//funções pré filtro (insere texto no HTML)
function showNoStatistics(){
  statisticList.innerHTML = `<h2>Nada a ser exibido</h2>`;
}

function showNoUsers(){
  userList.innerHTML = `<h2>Nenhum usuário filtrado</h2>`;
}

function showUsers(users){
  //título apresentado para contar o número de usuários pelo length do array obtido com filter (createElement insere conteúdo no HTML)
  const h2 = document.createElement('h2');
  h2.textContent = users.length + ' usuário(s) encontrado(s)';

  //inserir usuários na tela por "ul" pois conterá imagem+texto (nome e idade)
  const ul = document.createElement('ul');

  //transformar o array para criar um novo só com os elementos úteis na exibição (exclui id, lowerCase, gender, etc)
  users.map(({name, picture, age}) => {
    const li = document.createElement('li');
    li.classList.add('flex-row');

    const img = `<img class='avatar' src=${picture} alt=${name} title=${name}/>`;
    const span = `<span>${name}, ${age}, anos</span>`;

    li.innerHTML = `${img} ${span}`
    ul.appendChild(li);
  });
  userList.innerHTML = '';
  userList.appendChild(h2);
  userList.appendChild(ul);
}

function showStatistics(users) {
  const countMale = users.filter((user) => user.gender === 'male').length;
  const countFemale = users.filter((user) => user.gender === 'female').length;
  const sumAges = users.reduce((acc, curr) => acc + curr.age, 0);
  //se a média = 0 dará erro, portanto utiliza "||" (ou) quando for média zero, para retornar zero também no resultado
  const average = (sumAges / users.length || 0)
  //arredondar para 2 casas decimais:
    .toFixed(2)
  //trocar o ponto por vírgula (padrão EN/BR)
    .replace('.', ',');

    //renderizar na tela
  statisticList.innerHTML = `
      <h2>Estatísticas</h2>

      <ul>
        <li>Sexo masculino: <strong>${countMale}</strong></li>
        <li>Sexo feminino: <strong>${countFemale}</strong></li>
        <li>Soma das idades: <strong>${formatValue(sumAges)}</strong></li>
        <li>Média das idades: <strong>${average}</strong></li>
      </ul>    
    `;
}

//converter a soma das idades para padrão BR
function formatValue(value) {
  return formatter.format(value);
}