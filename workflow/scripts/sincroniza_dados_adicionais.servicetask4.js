var parentDocumentId = 0;
var colleagueId = "";
var DATASET_NAME = "fdwt_campos_adicionais_usuario";
var FLUIG_DOMAIN = "<DOMINIO_DO_FLUIG>"; // Insira o domínio do ambiente fluig alvo, seguindo o exemplo: http://dev2.digte.com.br:8080
var fluigCompanyId = "";
var fluigUsuario = "";
var fluigSenha = "";

function servicetask4(attempt, message) {
	log.info("@@ Inicio do servico sincroniza_dados_adicionais");
	
	try {
		// Credenciais para consumo do serviço de fichas do fluig (ECMCardService)
		// Preencher as variáveis 'fluigUsuario' e 'fluigSenha' com a identificação e a senha de um usuário com papel admin de seu ambiente fluig alvo
		// Você pode inserir as credenciais de acesso ao RP nesta sessão também
		fluigCompanyId = getValue("WKCompany");
		fluigUsuario = "<CODIGO_DO_USUARIO>"; // Informe aqui a identificação do usuário
		fluigSenha = "<SENHA_DO_USUARIO>"; // Informe aqui a senha do usuário
		
		// Acesso ao RP
		// Implemente aqui o acesso ao seu RP retornando as seguintes informações:
		// Precisamos das seguintes ações:
		// 1. Para cada cargo retornado de seu RP, preencha o objeto 'objDadoAdicional' com as devidas informações
		// 2. Para cada 'objDadoAdicional' criado, adicione o mesmo no array 'resultSet'
		// *campo de preenchimento obrigatório

		var resultSet = [];

		// Inicio - Seu trecho de código para incluir os dados adicionais no array resultSet
			var objDadoAdicional = {
				aniversarioDia: "05", // 1. aniversarioDia: dia da data de nascimento do colaborador (ex. de preenchimento: '05')
                aniversarioMes: "12", // 2. aniversarioMes: mes da data de nascimento do colaborador (ex. de preenchimento: '09')
                celular: "(11) 96580-6589", // 3. celular: celular do colaborador
                dataInicioEmpresa: "12/05/1995", // 4. dataInicioEmpresa: data de ingresso do colaborador na empresa (ex. de preenchimento: '05/08/1995')
                cargo: "465465", // 5. cargo: código do cargo do colaborador
                dataNascimento: "12/04/1980", // 6. dataNascimento: data de nascimento do colaborador (ex. de preenchimento: '05/08/1995')
                departamento: "654654", // 7. departamento: código do departamento do colaborador
                email: "contato@mail.com.br", // 8. email: e-mail do colaborador. Caso o colaborador possua um usuário do fluig, preencha com o e-mail de cadastro do fluig, se não possuir preencha com '.'
                empresa: "7817236", // 9. empresa: código da empresa do colaborador
                genero: "masculino", // 10. genero: gênero do colaborador (ex. de preenchimento: 'masculino' ou 'feminino')
                idPessoal: "456.987.456-32", // 11. idPessoal: CPF ou RG do colaborador
                login: "joao.deus", // 12. login: caso o colaborador possua um usuário do fluig, preencha com o login do fluig, se não possuir preencha com '.'
                matricula: "joao.deus.1", // 13. matricula: caso o colaborador possua um usuário do fluig, preencha com a matrícula do fluig, se não possuir preencha com '.'
                nome: "João", // 14. nome: primeiro nome do colaborador
                nomeCargo: "Desenvolvedor", // 15. nomeCargo: nome do cargo do colaborador
                nomeCompleto: "João de Deus da Silva", // 16. *nomeCompleto: nome completo do colaborador
                nomeDepartamento: "TI", // 17. nomeDepartamento: nome do departamento do colaborador
                nomeEmpresa: "Digte", // 18. nomeEmpresa: nome da empresa do colaborador
                nomeUnidade: "Unidade Zona Norte", // 19. nomeUnidade: nome da unidade do colaborador
                sobrenome: "de Deus da Silva", // 20. sobrenome: sobrenome do colaborador
                telefone: "(11) 6580-6589", // 21. telefone: telefone do colaborador
                unidade: "312873" // 22. unidade: código da unidade do colaborador
			};

			resultSet.push(objDadoAdicional);
		// Fim - Seu trecho de código para incluir os dados adicionais no array resultSet

        // A partir daqui não é necessário alterações no código
        synchronizeCards(resultSet);

		log.info("@@ Fim do servico sincroniza_dados_adicionais");

	} catch (e) {
		log.info("@@ Erro, estourou uma excecao");
		log.info("@@ e.message: " + e.toString());
		log.info("@@ Fim do servico sincroniza_dados_adicionais");
	}
}

function synchronizeCards(resultSet) {
    for (var i = 0; i < resultSet.length; i++) {
        var objDadoAdicional = resultSet[i];
        var c1 = DatasetFactory.createConstraint("matricula", objDadoAdicional.matricula, objDadoAdicional.matricula, ConstraintType.SHOULD);
        var c2 = DatasetFactory.createConstraint("login", objDadoAdicional.login, objDadoAdicional.login, ConstraintType.SHOULD);
        var c3 = DatasetFactory.createConstraint("email", objDadoAdicional.email, objDadoAdicional.email, ConstraintType.SHOULD);
        var c4 = DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST);
        var dsDadosAdicionais = DatasetFactory.getDataset(DATASET_NAME, null, [c1, c2, c3, c4], null);
        
        if (dsDadosAdicionais != null && dsDadosAdicionais.rowsCount > 0) {
            if (needsToUpdate(objDadoAdicional, dsDadosAdicionais)) {
                updateCard(dsDadosAdicionais, objDadoAdicional);
            }
            else {
                continue;
            }
        }
        else {
            createCard(objDadoAdicional);
        }
    }
}

function needsToUpdate(objDadoAdicional, dsDadosAdicionais) {
    var update = false;
    var arrFields = ["aniversarioDia", "aniversarioMes", "celular", "dataInicioEmpresa", "cargo", "dataNascimento", "departamento", "email", "empresa", "genero", "idPessoal", "login", "matricula", "nome", "nomeCargo", "nomeCompleto", "nomeDepartamento", "nomeEmpresa", "nomeUnidade", "sobrenome", "telefone", "unidade"];
    
    for (var i = 0; i < arrFields.length; i++) {
		if (dsDadosAdicionais.getValue(0, arrFields[i]) != objDadoAdicional[arrFields[i]]) {
			update = true;
		}
	}

	return update;
}

function updateCard(dsDadosAdicionais, objDadoAdicional) {
	var cardId = dsDadosAdicionais.getValue(0, "metadata#Id");

	if (cardId != 0) {
		var serviceUrl = FLUIG_DOMAIN + "/webdesk/ECMCardService?wsdl"
		var javaNetUrl = new java.net.URL(serviceUrl);

		var connection = javaNetUrl.openConnection();
		connection.setDoOutput(true);
		connection.setRequestMethod("POST");
		connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
		connection.setRequestProperty("SOAPAction", "updateCardData");
		
		var arrFields = returnFormFields(objDadoAdicional)

        var postData = new java.lang.StringBuilder();
        postData = getUpdateXML(postData, cardId, arrFields);

		var os = connection.getOutputStream();
		os.write(postData.toString().getBytes());
		os.flush();
		
		var responseCode = connection.getResponseCode();

		log.info("@@ Atualizado dado adicional " + objDadoAdicional.nomeCompleto + ":" + responseCode);
	}
	else {
		return false;
	}
}

function getUpdateXML(postData, cardId, arrFields) {
    postData.append('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.dm.ecm.technology.totvs.com/">');
        postData.append('<soapenv:Header/>');
        postData.append('<soapenv:Body>');
            postData.append('<ws:updateCardData>');
                postData.append('<companyId>' + fluigCompanyId + '</companyId>');
                postData.append('<username>' + fluigUsuario + '</username>');
                postData.append('<password>' + fluigSenha + '</password>');
                postData.append('<cardId>' + cardId + '</cardId>');
                postData.append('<cardData>');
                for (var i = 0; i < arrFields.length; i++) {
                    postData = treatUnixTimeStamp('item', arrFields, postData, i);
                    postData.append('<item>');
                        postData.append('<field>' + arrFields[i].fieldName + '</field>');
                        postData.append('<value name="' + arrFields[i].fieldName + '">' + arrFields[i].fieldValue + '</value>');
                    postData.append('</item>');
                }
                postData.append('</cardData>');
            postData.append('</ws:updateCardData>');
        postData.append('</soapenv:Body>');
    postData.append('</soapenv:Envelope>');

    return postData;
}

function createCard (objDadoAdicional) {
    if (parentDocumentId == 0) {
		var c1 = DatasetFactory.createConstraint("datasetName", DATASET_NAME, DATASET_NAME, ConstraintType.MUST);
		var c2 = DatasetFactory.createConstraint("activeVersion", true, true, ConstraintType.MUST);
		var dsDocument = DatasetFactory.getDataset("document", null, [c1, c2], null);

		if (dsDocument != null && dsDocument.rowsCount > 0) {
			parentDocumentId = dsDocument.getValue(0, "documentPK.documentId");
			colleagueId = dsDocument.getValue(0, "colleagueId");
		}
    }
    
	var serviceUrl = FLUIG_DOMAIN + "/webdesk/ECMCardService?wsdl"
	var javaNetUrl = new java.net.URL(serviceUrl);

	var connection = javaNetUrl.openConnection();
    connection.setDoOutput(true);
    connection.setRequestMethod("POST");
    connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
	connection.setRequestProperty("SOAPAction", "createCard");
	
	var arrFields = returnFormFields(objDadoAdicional)

    var postData = new java.lang.StringBuilder();
    postData = getCreateXML(postData, arrFields, objDadoAdicional, parentDocumentId);
	
	var os = connection.getOutputStream();
    os.write(postData.toString().getBytes());
	os.flush();
	
	var responseCode = connection.getResponseCode();

	log.info("@@ Criado dado adicional " + objDadoAdicional.nomeCompleto + ":" + responseCode )
}

function getCreateXML(postData, arrFields, objDadoAdicional, parentDocumentId) {
    postData.append('<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.dm.ecm.technology.totvs.com/">');
        postData.append('<soapenv:Header/>');
        postData.append('<soapenv:Body>');
            postData.append('<ws:createCard>');
                postData.append('<companyId>' + fluigCompanyId + '</companyId>');
                postData.append('<username>' + fluigUsuario + '</username>');
                postData.append('<password>' + fluigSenha + '</password>');
                postData.append('<card>');
                    postData.append('<item>');
                    for (var i = 0; i < arrFields.length; i++) {
                        postData = treatUnixTimeStamp('cardData', arrFields, postData, i);
                        postData.append('<cardData>');
                            postData.append('<field>' + arrFields[i].fieldName + '</field>');
                            postData.append('<value name="' + arrFields[i].fieldName + '">' + arrFields[i].fieldValue + '</value>');
                        postData.append('</cardData>');
                    }
                        postData.append(setDadosAdicionaisPermissions(arrFields, fluigCompanyId))
                        postData.append('<parentDocumentId>' + parentDocumentId + '</parentDocumentId>');
                        postData.append('<documentDescription>' + objDadoAdicional.cargoNome + '</documentDescription>');
                        postData.append('<inheritSecurity>true</inheritSecurity>')
                    postData.append('</item>');
                postData.append('</card>');
        postData.append('</ws:createCard>');
        postData.append('</soapenv:Body>');
    postData.append('</soapenv:Envelope>');
    return postData;
}

function treatUnixTimeStamp(type, arrFields, postData, i) {
    if (arrFields[i].fieldName == "dataInicioEmpresa" || arrFields[i].fieldName == "dataNascimento") {
        var dateUnixTimeStamp = Math.floor(new Date(arrFields[i].fieldValue).getTime()/1000)
        postData.append('<' + type + '>');
            postData.append('<field>' + arrFields[i].fieldName + 'Ts' + '</field>');
            postData.append('<value name="' + arrFields[i].fieldName + 'Ts' + '">' + dateUnixTimeStamp + '</value>');
        postData.append('</' + type + '>');    
    }

    return postData;
}

function returnFormFields(objDadoAdicional) {    
    var arrFields = [];
    var arrColumns = ["aniversarioDia", "aniversarioMes", "celular", "dataInicioEmpresa", "cargo", "dataNascimento", "departamento", "email", "empresa", "genero", "idPessoal", "login", "matricula", "nome", "nomeCargo", "nomeCompleto", "nomeDepartamento", "nomeEmpresa", "nomeUnidade", "sobrenome", "telefone", "unidade"];
    
    for (var i = 0; i < arrColumns.length; i++) {
        var fieldObj = {
            fieldName: arrColumns[i],
            fieldValue: objDadoAdicional[arrColumns[i]]
        };
        
        arrFields.push(fieldObj);
    }
    
    return arrFields;
}

function setDadosAdicionaisPermissions(arrFields, fluigCompanyId) {
    var matricula = "";
    for (var i = 0; i < arrFields.length; i++) {
        if (arrFields[i].fieldName == "matricula" && arrFields[i].fieldValue != "") {
            matricula = arrFields[i].fieldValue;
        }
    }

    var xmlMarkup = "<docsecurity>\
        <attributionType>1</attributionType>\
        <attributionValue>" + matricula + "</attributionValue>\
        <companyId>" + fluigCompanyId + "</companyId>\
        <documentId></documentId>\
        <downloadEnabled>true</downloadEnabled>\
        <foo></foo>\
        <permission>true</permission>\
        <securityLevel>2</securityLevel>\
        <securityVersion></securityVersion>\
        <sequence></sequence>\
        <showContent>true</showContent>\
        <version>1000</version>\
    </docsecurity>";

    return xmlMarkup;
}