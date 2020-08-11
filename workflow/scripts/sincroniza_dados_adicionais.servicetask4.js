var parentDocumentId = 0;
var colleagueId = "";
var DATASET_NAME = "fdwt_campos_adicionais_usuario"

var FLUIG_DOMAIN = "<DOMINIO_DO_FLUIG>" // Insira o domínio do ambiente fluig alvo, seguindo o exemplo: http://dev2.digte.com.br:8080

function servicetask4(attempt, message) {
	log.info("@@ Inicio do servico sincroniza_dados_adicionais");
	
	try {
		// Credenciais para consumo do serviço de fichas do fluig (ECMCardService)
		// Preencher as variáveis 'fluigUsuario' e 'fluigSenha' com a identificação e a senha de um usuário com papel admin de seu ambiente fluig alvo
		// Você pode inserir as credenciais de acesso ao RP nesta sessão também
		var fluigCompanyId = getValue("WKCompany");
		var fluigUsuario = "<CODIGO_DO_USUARIO>"; // Informe aqui a identificação do usuário
		var fluigSenha = "<SENHA_DO_USUARIO>"; // Informe aqui a senha do usuário
		
		// Acesso ao RP
		// Implemente aqui o acesso ao seu RP retornando as seguintes informações:
        // 1. aniversarioDia: dia da data de nascimento do colaborador (ex. de preenchimento: '05')
        // 2. aniversarioMes: mes da data de nascimento do colaborador (ex. de preenchimento: '09')
        // 3. celular: celular do colaborador
        // 4. dataInicioEmpresa: data de ingresso do colaborador na empresa (ex. de preenchimento: '05/08/1995')
        // 5. cargo: código do cargo do colaborador
        // 6. dataNascimento: data de nascimento do colaborador (ex. de preenchimento: '05/08/1995')
        // 7. departamento: código do departamento do colaborador
        // 8. email: e-mail do colaborador. Caso o colaborador possua um usuário do fluig, preencha com o e-mail de cadastro do fluig, se não possuir preencha com '.'
        // 9. empresa: código da empresa do colaborador
        // 10. genero: gênero do colaborador (ex. de preenchimento: 'masculino' ou 'feminino')
        // 11. idPessoal: CPF ou RG do colaborador
        // 12. login: caso o colaborador possua um usuário do fluig, preencha com o login do fluig, se não possuir preencha com '.'
        // 13. matricula: caso o colaborador possua um usuário do fluig, preencha com a matrícula do fluig, se não possuir preencha com '.'
        // 14. nome: primeiro nome do colaborador
        // 15. nomeCargo: nome do cargo do colaborador
        // 16. *nomeCompleto: nome completo do colaborador
        // 17. nomeDepartamento: nome do departamento do colaborador
        // 18. nomeEmpresa: nome da empresa do colaborador
        // 19. nomeUnidade: nome da unidade do colaborador
        // 20. sobrenome: sobrenome do colaborador
        // 21. telefone: telefone do colaborador
        // 22. unidade: código da unidade do colaborador
		// *campo de preenchimento obrigatório
		// Precisamos das seguintes ações:
		// 1. Para cada cargo retornado de seu RP, preencha o objeto 'objDadoAdicional' com as devidas informações
		// 2. Para cada 'objDadoAdicional' criado, adicione o mesmo no array 'resultSet'

		var resultSet = [];

		// Inicio - Seu trecho de código para incluir os dados adicionais no array resultSet
			var objDadoAdicional = {
				aniversarioDia: "05",
                aniversarioMes: "12",
                celular: "(11) 96580-6589",
                dataInicioEmpresa: "12/05/1995",
                cargo: "465465",
                dataNascimento: "12/04/1980",
                departamento: "654654",
                email: "contato@mail.com.br",
                empresa: "7817236",
                genero: "masculino",
                idPessoal: "456.987.456-32",
                login: "joao.deus",
                matricula: "joao.deus.1",
                nome: "João",
                nomeCargo: "Desenvolvedor",
                nomeCompleto: "João de Deus da Silva",
                nomeDepartamento: "TI",
                nomeEmpresa: "Digte",
                nomeUnidade: "Unidade Zona Norte",
                sobrenome: "de Deus da Silva",
                telefone: "(11) 6580-6589",
                unidade: "312873"
			};

			resultSet.push(objDadoAdicional);
		// Fim - Seu trecho de código para incluir os dados adicionais no array resultSet

		// A partir daqui não é necessário alterações no código
		for (var i = 0; i < resultSet.length; i++) {
			var objDadoAdicional = resultSet[i];
			var c1 = DatasetFactory.createConstraint("matricula", objDadoAdicional.matricula, objDadoAdicional.matricula, ConstraintType.SHOULD);
			var c2 = DatasetFactory.createConstraint("login", objDadoAdicional.login, objDadoAdicional.login, ConstraintType.SHOULD);
			var c3 = DatasetFactory.createConstraint("email", objDadoAdicional.email, objDadoAdicional.email, ConstraintType.SHOULD);
			var c4 = DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST);
			var dsDadosAdicionais = DatasetFactory.getDataset(DATASET_NAME, null, [c1, c2, c3, c4], null);
			
			if (dsDadosAdicionais != null && dsDadosAdicionais.rowsCount > 0) {
				if (needsToUpdate(objDadoAdicional, dsDadosAdicionais)) {
					updateCard(dsDadosAdicionais, objDadoAdicional, fluigCompanyId, fluigUsuario, fluigSenha);
				}
				else {
					continue;
				}
			}
			else {
				createCard(objDadoAdicional, fluigCompanyId, fluigUsuario, fluigSenha);
			}
		}

		log.info("@@ Fim do servico sincroniza_dados_adicionais");

	} catch (e) {
		log.info("@@ Erro, estourou uma excecao");
		log.info("@@ e.message: " + e.toString());
		log.info("@@ Fim do servico sincroniza_dados_adicionais");
	}
}

function needsToUpdate(objDadoAdicional, dsDadosAdicionais) {
    var update = false;
    
    if (dsDadosAdicionais.getValue(0, "aniversarioDia") != objDadoAdicional.aniversarioDia ||
        dsDadosAdicionais.getValue(0, "aniversarioMes") != objDadoAdicional.aniversarioMes ||
        dsDadosAdicionais.getValue(0, "celular") != objDadoAdicional.celular ||
        dsDadosAdicionais.getValue(0, "dataInicioEmpresa") != objDadoAdicional.dataInicioEmpresa ||
        dsDadosAdicionais.getValue(0, "cargo") != objDadoAdicional.cargo ||
        dsDadosAdicionais.getValue(0, "dataNascimento") != objDadoAdicional.dataNascimento ||
        dsDadosAdicionais.getValue(0, "departamento") != objDadoAdicional.departamento ||
        dsDadosAdicionais.getValue(0, "email") != objDadoAdicional.email ||
        dsDadosAdicionais.getValue(0, "empresa") != objDadoAdicional.empresa ||
        dsDadosAdicionais.getValue(0, "genero") != objDadoAdicional.genero ||
        dsDadosAdicionais.getValue(0, "idPessoal") != objDadoAdicional.idPessoal ||
        dsDadosAdicionais.getValue(0, "login") != objDadoAdicional.login ||
        dsDadosAdicionais.getValue(0, "matricula") != objDadoAdicional.matricula ||
        dsDadosAdicionais.getValue(0, "nome") != objDadoAdicional.nome ||
        dsDadosAdicionais.getValue(0, "nomeCargo") != objDadoAdicional.nomeCargo ||
        dsDadosAdicionais.getValue(0, "nomeCompleto") != objDadoAdicional.nomeCompleto ||
        dsDadosAdicionais.getValue(0, "nomeDepartamento") != objDadoAdicional.nomeDepartamento ||
        dsDadosAdicionais.getValue(0, "nomeEmpresa") != objDadoAdicional.nomeEmpresa ||
        dsDadosAdicionais.getValue(0, "nomeUnidade") != objDadoAdicional.nomeUnidade ||
        dsDadosAdicionais.getValue(0, "sobrenome") != objDadoAdicional.sobrenome ||
        dsDadosAdicionais.getValue(0, "telefone") != objDadoAdicional.telefone ||
        dsDadosAdicionais.getValue(0, "unidade") != objDadoAdicional.unidade) {
        update = true;
    }

	return update;
}

function updateCard(dsDadosAdicionais, objDadoAdicional, fluigCompanyId, fluigUsuario, fluigSenha) {
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
                        if (arrFields[i].fieldName == "dataInicioEmpresa" || arrFields[i].fieldName == "dataNascimento") {
                            var dateUnixTimeStamp = Math.floor(new Date(arrFields[i].fieldValue).getTime()/1000)
                            postData.append('<item>');
                                postData.append('<field>' + arrFields[i].fieldName + 'Ts' + '</field>');
                                postData.append('<value name="' + arrFields[i].fieldName + 'Ts' + '">' + dateUnixTimeStamp + '</value>');
						    postData.append('</item>');    
                        }
                        
						postData.append('<item>');
							postData.append('<field>' + arrFields[i].fieldName + '</field>');
							postData.append('<value name="' + arrFields[i].fieldName + '">' + arrFields[i].fieldValue + '</value>');
						postData.append('</item>');
					}
					postData.append('</cardData>');
				postData.append('</ws:updateCardData>');
			postData.append('</soapenv:Body>');
		postData.append('</soapenv:Envelope>');

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

function createCard (objDadoAdicional, fluigCompanyId, fluigUsuario, fluigSenha) {
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
                        if (arrFields[i].fieldName == "dataInicioEmpresa" || arrFields[i].fieldName == "dataNascimento") {
                            var dateUnixTimeStamp = Math.floor(new Date(arrFields[i].fieldValue).getTime()/1000)
                            postData.append('<cardData>');
                                postData.append('<field>' + arrFields[i].fieldName + 'Ts' + '</field>');
                                postData.append('<value name="' + arrFields[i].fieldName + 'Ts' + '">' + dateUnixTimeStamp + '</value>');
						    postData.append('</cardData>');    
                        }
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
	
	var os = connection.getOutputStream();
    os.write(postData.toString().getBytes());
	os.flush();
	
	var responseCode = connection.getResponseCode();

	log.info("@@ Criado dado adicional " + objDadoAdicional.nomeCompleto + ":" + responseCode )
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