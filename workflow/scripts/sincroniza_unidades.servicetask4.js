var parentDocumentId = 0;
var colleagueId = "";
var DATASET_NAME = "fdwt_lojas"

var FLUIG_DOMAIN = "<DOMINIO_DO_FLUIG>" // Insira o domínio do ambiente fluig alvo, seguindo o exemplo: http://dev2.digte.com.br:8080

function servicetask4(attempt, message) {
	log.info("@@ Inicio do servico sincroniza_unidades");
	
	try {
		// Credenciais para consumo do serviço de fichas do fluig (ECMCardService)
		// Preencher as variáveis 'fluigUsuario' e 'fluigSenha' com a identificação e a senha de um usuário com papel admin de seu ambiente fluig alvo
		// Você pode inserir as credenciais de acesso ao RP nesta sessão também
		var fluigCompanyId = getValue("WKCompany");
		var fluigUsuario = "<CODIGO_DO_USUARIO>"; // Informe aqui a identificação do usuário
		var fluigSenha = "<SENHA_DO_USUARIO>"; // Informe aqui a senha do usuário
		
		// Acesso ao RP
		// Implemente aqui o acesso ao seu RP retornando as seguintes informações:
		// Precisamos das seguintes ações:
		// 1. Para cada unidade retornada de seu RP, preencha o objeto 'objUnidade' com as devidas informações
		// 2. Para cada 'objUnidade' criado, adicione o mesmo no array 'resultSet'
		// *campo de preenchimento obrigatório

		var resultSet = [];

		// Inicio - Seu trecho de código para incluir os cargos no array resultSet
			var objUnidade = {
                lojaBairro: 'Santana', // 1. lojaBairro: bairro da unidade
                lojaCEP: '98765-98', // 2. lojaCEP: código postal da unidade (ex. de preenchimento: '99999-999')
                lojaCelular: '(11) 98765-0987', // 3. lojaCelular: celular de contato da unidade
                lojaCidade: 'São Paulo', // 4. lojaCidade: cidade em que se localiza a unidade (ex. de preenchimento: 'São Paulo')
                lojaCnpjCpf: '99.999.999/9999-99', // 5. lojaCnpjCpf: CNPJ ou CPF de cadastro da unidade (ex. de preenchimento: '99.999.999/9999-99' ou '999.999.999-99')
                lojaComplemento: 'Conjunto 105', // 6. lojaComplemento: complemento do endereço da unidade (ex. de preenchimento: 'CJ 105')
                lojaEmail: 'contato@mail.com.br', // 7. lojaEmail: e-mail de contato da unidade
                lojaEndereco: 'Avenida Braz Leme', // 8. lojaEndereco: nome da rua, avenida, alameda, entre outros tipos de logradouros (ex. de preenchimento: 'Rua dos Bobos')
                lojaEstado: 'SP', // 9. lojaEstado: estado em que se localiza a unidade (ex. de preenchimento: 'SP')
                lojaCodigo: '16351236', // 10. *lojaCodigo: código da unidade cadastrado no seu RP ou base de dados
                lojaNome: 'Unidade Zona Norte', // 11. *lojaNome: nome unidade
                lojaNumero: '1000', // 12. lojaNumero: numero do logradouro da unidade
                lojaPais: 'Brasil', // 13. lojaPais: país onde a unidade se localiza
                lojaRazaoSocial: 'Digte Tecnologia da Informação LTDA.', // 14. lojaRazaoSocial: razão social da unidade da unidade
                lojaTelefone: '(11) 8765-0987', // 15. lojaTelefone: telefone de contato da unidade
                nomeLojaCidade: 'São Paulo - SP', // 16. nomeLojaCidade: (ex. de preenchimento: 'São Paulo - SP')
                validarEndereco: 'sim' // 17. validarEndereco: (ex. de preenchimento: 'sim' - calculará latitude e longitude com base nos dados de endereço informados / 'nao' - calculará latitude e longitude com base nos dados de endereço informados)
			};

			resultSet.push(objUnidade);
		// Fim - Seu trecho de código para incluir os cargos no array resultSet

        // A partir daqui não é necessário alterações no código
		synchronizeCards(resultSet, fluigCompanyId, fluigUsuario, fluigSenha)

		log.info("@@ Fim do servico sincroniza_unidades");

	} catch (e) {
		log.info("@@ Erro, estourou uma excecao");
		log.info("@@ e.message: " + e.toString());
		log.info("@@ Fim do servico sincroniza_unidades");
	}
}

function synchronizeCards(resultSet, fluigCompanyId, fluigUsuario, fluigSenha) {
	for (var i = 0; i < resultSet.length; i++) {
		var objUnidade = resultSet[i];
		var c1 = DatasetFactory.createConstraint("lojaCodigo", objUnidade.lojaCodigo, objUnidade.lojaCodigo, ConstraintType.MUST);
		var c2 = DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST);
		var dsUnidade = DatasetFactory.getDataset(DATASET_NAME, null, [c1, c2], null);
		
		if (dsUnidade != null && dsUnidade.rowsCount > 0) {
			if (needsToUpdate(objUnidade, dsUnidade)) {
				updateCard(dsUnidade, objUnidade, fluigCompanyId, fluigUsuario, fluigSenha);
			}
			else {
				continue;
			}
		}
		else {
			createCard(objUnidade, fluigCompanyId, fluigUsuario, fluigSenha);
		}
	}
}

function needsToUpdate(objUnidade, dsUnidade) {
	var update = false;
	var arrFields = ["lojaBairro", "lojaCEP", "lojaCelular", "lojaCidade", "lojaCnpjCpf", "lojaComplemento", "lojaEmail", "lojaEndereco", "lojaEstado", "lojaCodigo", "lojaNome", "lojaNumero", "lojaPais", "lojaRazaoSocial", "lojaTelefone", "nomeLojaCidade", "validarEndereco"];
    
    for (var i = 0; i < arrFields.length; i++) {
		if (dsUnidade.getValue(0, arrFields[i]) != objUnidade[arrFields[i]]) {
			update = true;
		}
	}

	return update;
}

function updateCard(dsUnidade, objUnidade, fluigCompanyId, fluigUsuario, fluigSenha) {
	var cardId = dsUnidade.getValue(0, "metadata#Id");

	if (cardId != 0) {
		var serviceUrl = FLUIG_DOMAIN + "/webdesk/ECMCardService?wsdl"
		var javaNetUrl = new java.net.URL(serviceUrl);

		var connection = javaNetUrl.openConnection();
		connection.setDoOutput(true);
		connection.setRequestMethod("POST");
		connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
		connection.setRequestProperty("SOAPAction", "updateCardData");
		
		var arrFields = returnFormFields(objUnidade)

		var postData = new java.lang.StringBuilder();
		postData = getUpdateXML(postData, fluigCompanyId, fluigUsuario, fluigSenha, cardId, arrFields);

		var os = connection.getOutputStream();
		os.write(postData.toString().getBytes());
		os.flush();
		
		var responseCode = connection.getResponseCode();

		log.info("@@ Atualizado unidade " + objUnidade.lojaCodigo + ":" + responseCode )
	}
	else {
		return false;
	}
}

function getUpdateXML(postData, fluigCompanyId, fluigUsuario, fluigSenha, cardId, arrFields) {
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

function createCard (objUnidade, fluigCompanyId, fluigUsuario, fluigSenha) {
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
	
	var arrFields = returnFormFields(objUnidade)

	var postData = new java.lang.StringBuilder();
	postData = getCreateXML(postData, fluigCompanyId, fluigUsuario, fluigSenha, arrFields, objUnidade, parentDocumentId);
	
	var os = connection.getOutputStream();
    os.write(postData.toString().getBytes());
	os.flush();
	
	var responseCode = connection.getResponseCode();

	log.info("@@ Criado unidade " + objUnidade.lojaCodigo + ":" + responseCode )
}

function getCreateXML(postData, fluigCompanyId, fluigUsuario, fluigSenha, arrFields, objUnidade, parentDocumentId) {
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
						postData.append('<cardData>');
							postData.append('<field>' + arrFields[i].fieldName + '</field>');
							postData.append('<value name="' + arrFields[i].fieldName + '">' + arrFields[i].fieldValue + '</value>');
						postData.append('</cardData>');
					}
						postData.append('<parentDocumentId>' + parentDocumentId + '</parentDocumentId>');
						postData.append('<documentDescription>' + objUnidade.lojaNome + '</documentDescription>');
					postData.append('</item>');
				postData.append('</card>');
		postData.append('</ws:createCard>');
		postData.append('</soapenv:Body>');
	postData.append('</soapenv:Envelope>');

	return postData;
}

function returnFormFields(objUnidade) {    
    var arrFields = [];
    var arrColumns = ["lojaBairro", "lojaCEP", "lojaCelular", "lojaCidade", "lojaCnpjCpf", "lojaComplemento", "lojaEmail", "lojaEndereco", "lojaEstado", "lojaCodigo", "lojaNome", "lojaNumero", "lojaPais", "lojaRazaoSocial", "lojaTelefone", "nomeLojaCidade", "validarEndereco"];
    
    for (var i = 0; i < arrColumns.length; i++) {
        var fieldObj = {
            fieldName: arrColumns[i],
            fieldValue: objUnidade[arrColumns[i]]
        };
        
        arrFields.push(fieldObj);
    }
    
    return arrFields;
}