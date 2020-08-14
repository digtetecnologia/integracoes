var parentDocumentId = 0;
var colleagueId = "";
var DATASET_NAME = "fdwt_estrutura_empresa_cargo";
var FLUIG_DOMAIN = "<DOMINIO_DO_FLUIG>"; // Insira o domínio do ambiente fluig alvo, seguindo o exemplo: http://dev2.digte.com.br:8080
var fluigCompanyId = "";
var fluigUsuario = "";
var fluigSenha = "";

function servicetask4(attempt, message) {
	log.info("@@ Inicio do servico sincroniza_cargos");
	
	try {
		// Credenciais para consumo do serviço de fichas do fluig (ECMCardService)
		// Preencher as variáveis 'fluigUsuario' e 'fluigSenha' com a identificação e a senha de um usuário com papel admin de seu ambiente fluig alvo
		// Você pode inserir as credenciais de acesso ao RP nesta sessão também
		fluigCompanyId = getValue("WKCompany");
		fluigUsuario = "<CODIGO_DO_USUARIO>"; // Informe aqui a identificação do usuário
		fluigSenha = "<SENHA_DO_USUARIO>"; // Informe aqui a senha do usuário
		
		// Acesso ao RP
		// Precisamos das seguintes ações:
		// 1. Para cada cargo retornado de seu RP, preencha o objeto 'objCargo' com as devidas informações
		// 2. Para cada 'objCargo' criado, adicione o mesmo no array 'resultSet'
		// *campo de preenchimento obrigatório

		var resultSet = [];

		// Inicio - Seu trecho de código para incluir os cargos no array resultSet
			var objCargo = {
				cargoId: '6435438', // 1. *cargoId: Código do cargo
				cargoNome: 'Analista de Dados' // 2. *cargoNome: Nome do cargo
			};

			resultSet.push(objCargo);
		// Fim - Seu trecho de código para incluir os cargos no array resultSet

		// A partir daqui não é necessário alterações no código
		synchronizeCards(resultSet);

		log.info("@@ Fim do servico sincroniza_cargos");
	} catch (e) {
		log.info("@@ Erro, estourou uma excecao");
		log.info("@@ e.message: " + e.toString());
		log.info("@@ Fim do servico sincroniza_cargos");
	}
}

function synchronizeCards(resultSet) {
	for (var i = 0; i < resultSet.length; i++) {
		var objCargo = resultSet[i];
		var c1 = DatasetFactory.createConstraint("cargoId", objCargo.cargoId, objCargo.cargoId, ConstraintType.MUST);
		var c2 = DatasetFactory.createConstraint("metadata#active", true, true, ConstraintType.MUST);
		var dsCargo = DatasetFactory.getDataset(DATASET_NAME, null, [c1, c2], null);
		
		if (dsCargo != null && dsCargo.rowsCount > 0) {
			if (needsToUpdate(objCargo, dsCargo)) {
				updateCard(dsCargo, objCargo);
			}
			else {
				continue;
			}
		}
		else {
			createCard(objCargo);
		}
	}
}

function needsToUpdate(objCargo, dsCargo) {
	var update = false;
	var arrFields = ["cargoId", "cargoNome"];

	for (var i = 0; i < arrFields.length; i++) {
		if (dsCargo.getValue(0, arrFields[i]) != objCargo[arrFields[i]]) {
			update = true;
		}
	}

	return update;
}

function updateCard(dsCargo, objCargo) {
	var cardId = dsCargo.getValue(0, "metadata#Id");

	if (cardId != 0) {
		var serviceUrl = FLUIG_DOMAIN + "/webdesk/ECMCardService?wsdl"
		var javaNetUrl = new java.net.URL(serviceUrl);

		var connection = javaNetUrl.openConnection();
		connection.setDoOutput(true);
		connection.setRequestMethod("POST");
		connection.setRequestProperty("Content-Type", "text/xml; charset=utf-8");
		connection.setRequestProperty("SOAPAction", "updateCardData");
		
		var arrFields = returnFormFields(objCargo)

		var postData = new java.lang.StringBuilder();
		postData = getUpdateXML(postData, cardId, arrFields);

		var os = connection.getOutputStream();
		os.write(postData.toString().getBytes());
		os.flush();
		
		var responseCode = connection.getResponseCode();

		log.info("@@ Atualizado cargo " + objCargo.cargoId + ":" + responseCode )
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

function createCard (objCargo) {
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
	
	var arrFields = returnFormFields(objCargo)

	var postData = new java.lang.StringBuilder();
	postData = getCreateXML(postData, arrFields, objCargo, parentDocumentId);
	
	var os = connection.getOutputStream();
    os.write(postData.toString().getBytes());
	os.flush();
	
	var responseCode = connection.getResponseCode();

	log.info("@@ Criado cargo " + objCargo.cargoId + ":" + responseCode )
}

function getCreateXML(postData, arrFields, objCargo, parentDocumentId) {
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
						postData.append('<documentDescription>' + objCargo.cargoNome + '</documentDescription>');
					postData.append('</item>');
				postData.append('</card>');
		postData.append('</ws:createCard>');
		postData.append('</soapenv:Body>');
	postData.append('</soapenv:Envelope>');

	return postData;
}

function returnFormFields(objCargo) {    
    var arrFields = [];
    var arrColumns = ["cargoId", "cargoNome"];
    
    for (var i = 0; i < arrColumns.length; i++) {
        var fieldObj = {
            fieldName: arrColumns[i],
            fieldValue: objCargo[arrColumns[i]]
        };
        
        arrFields.push(fieldObj);
    }
    
    return arrFields;
}